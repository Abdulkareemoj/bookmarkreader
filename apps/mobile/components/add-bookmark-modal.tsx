import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus } from "lucide-react-native";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useCollectionsStore } from "@/lib/store";
import type { Option } from "@/components/ui/multi-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTags } from "@/hooks/use-tags";
import { fetchBookmarkMetadata } from "@/lib/metadata";

const bookmarkSchema = z.object({
	url: z.url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	tags: z.array(z.string()).default([]),
	collections: z.array(z.string()).default(["inbox"]),
});

interface AddBookmarkModalProps {
	onAddBookmark: (data: {
		url: string;
		title: string;
		collectionId: string;
		tags: string[];
		image?: string;
	}) => void;
}

export function AddBookmarkModal({ onAddBookmark }: AddBookmarkModalProps) {
	const [open, setOpen] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [fetchedImage, setFetchedImage] = React.useState<string | undefined>();
	const { bookmarkCollections, addBookmarkCollection } = useCollectionsStore();
	const { tagOptions } = useTags();

	const collectionOptions = React.useMemo<Option[]>(
		() =>
			bookmarkCollections
				.filter((c) => c.id !== "all")
				.map((c) => ({ value: c.id, label: c.name })),
		[bookmarkCollections],
	);

	const form = useForm({
		defaultValues: {
			url: "",
			title: "",
			tags: [] as string[],
			collections: ["inbox"] as string[],
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
			const collectionId =
				value.collections.length > 0
					? value.collections[value.collections.length - 1]
					: "inbox";
			onAddBookmark({
				url: value.url,
				title: value.title,
				collectionId,
				tags: value.tags,
				image: fetchedImage,
			});
			setFetchedImage(undefined);
			form.reset();
			setOpen(false);
		},
	});

	React.useEffect(() => {
		const url = form.getFieldValue("url");
		const title = form.getFieldValue("title");

		const fetchMetadata = async () => {
			const valid = bookmarkSchema.shape.url.safeParse(url).success;
			if (!url || !valid) return;

			setIsLoading(true);
			try {
				const metadata = await fetchBookmarkMetadata(url);
				if (!title.trim() && metadata.title) {
					form.setFieldValue("title", metadata.title);
				}
				if (metadata.image) {
					setFetchedImage(metadata.image);
				}
			} catch {
				// Silent fail
			} finally {
				setIsLoading(false);
			}
		};

		const timeoutId = setTimeout(fetchMetadata, 800);
		return () => clearTimeout(timeoutId);
	}, [form.getFieldValue("url"), form.getFieldValue("title"), form]);

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) {
					setFetchedImage(undefined);
					form.reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="default" className="w-full shadow-lg">
					<Plus size={20} color="white" className="mr-2" />
					<Text className="font-semibold text-white">Add Bookmark</Text>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Add New Bookmark</DialogTitle>
					<DialogDescription>
						Enter the details for the new bookmark. Click save when you're done.
					</DialogDescription>
				</DialogHeader>

				<View className="gap-4 py-4">
					<form.Field
						name="url"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="url-label">URL</Label>
								<View className="relative">
									<Input
										placeholder="https://example.com"
										value={field.state.value}
										onChangeText={field.handleChange}
										onBlur={field.handleBlur}
										autoCapitalize="none"
										keyboardType="url"
									/>
									{isLoading && (
										<View className="absolute right-3 top-3">
											<ActivityIndicator size="small" />
										</View>
									)}
								</View>
								{field.state.meta.errors && (
									<Text className="text-destructive text-xs">
										{field.state.meta.errors.join(", ")}
									</Text>
								)}
							</View>
						)}
					/>

					<form.Field
						name="title"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="title-label">Title</Label>
								<Input
									placeholder="Bookmark Title"
									value={field.state.value}
									onChangeText={field.handleChange}
									onBlur={field.handleBlur}
								/>
								{field.state.meta.errors && (
									<Text className="text-destructive text-xs">
										{field.state.meta.errors.join(", ")}
									</Text>
								)}
							</View>
						)}
					/>

					<form.Field
						name="collections"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="collections-label">Collection</Label>
								<MultiSelect
									value={collectionOptions.filter((c) =>
										field.state.value.includes(c.value),
									)}
									options={collectionOptions}
									onChange={(options) => {
										field.handleChange(options.map((o) => o.value));
									}}
									placeholder="Select a collection"
									hidePlaceholderWhenSelected
									maxSelected={1}
									creatable
									onSearchSync={(val) => {
										if (!val.trim()) return collectionOptions;
										const lower = val.toLowerCase();
										return collectionOptions.filter((c) =>
											c.label.toLowerCase().includes(lower),
										);
									}}
								/>
							</View>
						)}
					/>

					<form.Field
						name="tags"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="tags-label">Tags</Label>
								<MultiSelect
									value={field.state.value.map((tag: string) => ({
										value: tag,
										label: tag,
									}))}
									options={tagOptions}
									onChange={(options) => {
										field.handleChange(options.map((opt) => opt.value));
									}}
									creatable
									placeholder="Select tags"
									onSearchSync={(val) => {
										if (!val.trim()) return tagOptions;
										const lower = val.toLowerCase();
										return tagOptions.filter((t) =>
											t.label.toLowerCase().includes(lower),
										);
									}}
								/>
								{field.state.meta.errors && (
									<Text className="text-destructive text-xs">
										{field.state.meta.errors.join(", ")}
									</Text>
								)}
							</View>
						)}
					/>
				</View>

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
									onPress={() => form.handleSubmit()}
									disabled={!hasFields || state.isSubmitting}
									className="mt-2 w-full"
								>
									<Text className="font-semibold text-white">
										{state.isSubmitting ? "Saving..." : "Save Bookmark"}
									</Text>
								</Button>
							);
						}}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
