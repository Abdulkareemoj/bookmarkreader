import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
const bookmarkSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	tags: z.array(z.string()).default([]).optional(),
	collectionId: z.string().default("inbox"),
});

// Define props for the dialog
interface AddBookmarkDialogProps {
	onAddBookmark: (data: {
		url: string;
		title: string;
		tags: string[];
		collectionId: string;
		image?: string;
	}) => void;
}

export function AddBookmarkDialog({ onAddBookmark }: AddBookmarkDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string>("");
	const [fetchedImage, setFetchedImage] = useState<string | undefined>(
		undefined,
	);

	const { bookmarkAgent } = useReaderStore((state) => state);
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
				const result = bookmarkSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
			onSubmit: ({ value }) => {
				const result = bookmarkSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
		},
		onSubmit: async ({ value }) => {
			onAddBookmark({
				...value,
				image: fetchedImage,
			});
			form.reset();
			setFetchedImage(undefined);
			setOpen(false);
		},
	});

	// Auto-fetch metadata when URL changes
	useEffect(() => {
		const url = form.getFieldValue("url");
		const title = form.getFieldValue("title");

		const fetchMetadata = async () => {
			if (!url || !bookmarkSchema.shape.url.safeParse(url).success) {
				setFetchError("");
				setIsLoading(false);
				return;
			}

			setFetchError("");
			setIsLoading(true);

			try {
				const metadata = await bookmarkAgent.fetchMetadata(url);

				// Only auto-fill title if user hasn't entered one
				if (!title.trim()) {
					form.setFieldValue("title", metadata.title || "");
				}
				// Store the fetched image
				setFetchedImage(metadata.image);
			} catch (error) {
				console.error("Failed to fetch metadata:", error);
				// Don't show error for CORS/network issues, just log it
				// User can still add bookmark manually
			} finally {
				setIsLoading(false);
			}
		};

		const timeoutId = setTimeout(fetchMetadata, 800); // Increased debounce time
		return () => clearTimeout(timeoutId);
	}, [
		form.getFieldValue("url"),
		form.getFieldValue("title"),
		bookmarkAgent,
		form,
	]);

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) {
					form.reset();
					setFetchError("");
					setIsLoading(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus data-icon="inline-start" className="mr-2" />
					Add Bookmark
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Bookmark</DialogTitle>
					<DialogDescription>
						Enter the details for the new bookmark. Click save when you're done.
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
										<div className="relative">
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
											{isLoading && (
												<Spinner
													data-icon="inline-end"
													className="absolute top-2.5 right-2 animate-spin text-muted-foreground"
												/>
											)}
										</div>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{fetchError && (
							<div className="text-sm text-yellow-600">{fetchError}</div>
						)}

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
						<form.Subscribe
							selector={(state) => ({
								values: state.values,
								isSubmitting: state.isSubmitting,
							})}
							children={(state) => {
								const hasFields =
									state.values.url.trim() !== "" &&
									state.values.title.trim() !== "";

								return (
									<Button
										type="submit"
										disabled={!hasFields || state.isSubmitting}
									>
										{state.isSubmitting ? (
											<>
												<Spinner
													data-icon="inline-start"
													className="mr-2 animate-spin"
												/>
												Saving...
											</>
										) : isLoading ? (
											<>
												<Spinner
													data-icon="inline-start"
													className="mr-2 animate-spin"
												/>
												Fetching...
											</>
										) : (
											"Save Bookmark"
										)}
									</Button>
								);
							}}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
