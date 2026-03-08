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
import MultipleSelector from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

			await updateBookmark(bookmark.id, value);
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
								return (
									<Field>
										<FieldLabel>Collection</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a collection" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Collections</SelectLabel>
													{bookmarkCollections.map((c) => (
														<SelectItem key={c.id} value={c.id}>
															{c.name}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
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
									<Spinner className="mr-2 h-4 w-4 animate-spin" />
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
