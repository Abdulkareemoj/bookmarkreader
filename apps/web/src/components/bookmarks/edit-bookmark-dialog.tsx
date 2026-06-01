import type { Bookmark } from "@packages/store";
import { useForm } from "@tanstack/react-form";

import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import MultipleSelector, { type Option } from "@/components/ui/multi-select";
import { Spinner } from "@/components/ui/spinner";
import { useTags } from "@/hooks/use-tags";
import { useCollectionsStore } from "@/lib/collections-store";
import { useReaderStore } from "@/lib/store";

// Define the form schema with Zod
const editBookmarkSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	tags: z.array(z.string()).default([]),
	collectionId: z.string().default("inbox"),
});

interface EditBookmarkDialogProps {
	bookmark: Bookmark | null;
	isOpen: boolean;
	onClose: () => void;
}

export function EditBookmarkDialog({
	bookmark,
	isOpen,
	onClose,
}: EditBookmarkDialogProps) {
	const { updateBookmark } = useReaderStore((state) => state);
	const { tagOptions } = useTags();
	const { bookmarkCollections } = useCollectionsStore();

	const form = useForm({
		defaultValues: {
			url: "",
			title: "",
			tags: [] as string[],
			collectionId: "inbox",
		},
		validators: {
			onChange: ({ value }) => {
				const result = editBookmarkSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
			onSubmit: ({ value }) => {
				const result = editBookmarkSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
		},
		onSubmit: async ({ value }) => {
			if (!bookmark) return;

			await updateBookmark(bookmark.id, {
				url: value.url,
				title: value.title,
				tags: value.tags,
				collectionId: value.collectionId,
			});
			onClose();
		},
	});

	// Initialize form when bookmark changes
	useEffect(() => {
		if (bookmark && isOpen) {
			form.setFieldValue("url", bookmark.url || "");
			form.setFieldValue("title", bookmark.title || "");
			form.setFieldValue("tags", bookmark.tags || []);
			form.setFieldValue("collectionId", bookmark.collectionId || "inbox");
		}
	}, [bookmark, isOpen, form]);

	if (!bookmark) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Bookmark</DialogTitle>
					<DialogDescription>
						Update the details for this bookmark. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup className="py-4">
						<form.Field
							name="url"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>URL</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="https://example.com"
											aria-invalid={isInvalid}
											className={isInvalid ? "border-red-500" : ""}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="title"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Title</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Bookmark title"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="tags"
							mode="array"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;

								// Convert string array to Option format for MultipleSelector
								const selectedTags = field.state.value.map((tag) => ({
									value: tag,
									label: tag,
								}));

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Tags</FieldLabel>
										<MultipleSelector
											commandProps={{
												label: "Select tags",
											}}
											value={selectedTags}
											defaultOptions={tagOptions}
											onChange={(options) => {
												const tags = options.map((opt) => opt.value);
												field.setValue(tags);
											}}
											creatable
											placeholder="Select tags"
											hideClearAllButton
											hidePlaceholderWhenSelected
											emptyIndicator={
												<p className="text-center text-sm">No results found</p>
											}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="collectionId"
							children={(field) => {
								const collectionOptions: Option[] = bookmarkCollections
									.filter((c) => c.id !== "all")
									.map((c) => ({ value: c.id, label: c.name }));

								const selectedOption = collectionOptions.find(
									(c) => c.value === field.state.value,
								);

								return (
									<Field>
										<FieldLabel>Collection</FieldLabel>
										<MultipleSelector
											value={selectedOption ? [selectedOption] : []}
											options={collectionOptions}
											onChange={(options) => {
												field.handleChange(
													options.length > 0
														? options[options.length - 1].value
														: "inbox",
												);
											}}
											creatable
											maxSelected={1}
											placeholder="Select a collection"
											hideClearAllButton
											hidePlaceholderWhenSelected
											emptyIndicator={
												<p className="text-center text-sm">No results found</p>
											}
										/>
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!form.state.isDirty || form.state.isSubmitting}
						>
							{form.state.isSubmitting ? (
								<>
									<Spinner
										data-icon="inline-start"
										className="mr-2 animate-spin"
									/>
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
