import type { Bookmark } from "@packages/store";
import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { View } from "react-native";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import type { Option } from "@/components/ui/multi-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTags } from "@/hooks/use-tags";
import { useCollectionsStore, useReaderStore } from "@/lib/store";

const editBookmarkSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	tags: z.array(z.string()).default([]),
	collections: z.array(z.string()).default(["inbox"]),
});

interface EditBookmarkModalProps {
	bookmark: Bookmark | null;
	isOpen: boolean;
	onClose: () => void;
}

export function EditBookmarkModal({
	bookmark,
	isOpen,
	onClose,
}: EditBookmarkModalProps) {
	const { updateBookmark } = useReaderStore((s) => s);
	const { bookmarkCollections, addBookmarkCollection } = useCollectionsStore();
	const { tagOptions } = useTags();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const collectionOptions = React.useMemo<Option[]>(
		() =>
			bookmarkCollections
				.filter((c) => c.id !== "all")
				.map((c) => ({ value: c.id, label: c.name })),
		[bookmarkCollections],
	);

	const form = useForm({
		defaultValues: {
			url: bookmark?.url || "",
			title: bookmark?.title || "",
			tags: bookmark?.tags || [],
			collections: [bookmark?.collectionId || "inbox"],
		},
		onSubmit: async ({ value }) => {
			if (!bookmark) return;

			setIsSubmitting(true);
			try {
				const collectionId =
					value.collections.length > 0
						? value.collections[value.collections.length - 1]
						: "inbox";
				await updateBookmark(bookmark.id, {
					url: value.url,
					title: value.title,
					tags: value.tags,
					collectionId,
				});
				onClose();
			} catch (error) {
				console.error("Failed to update bookmark:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	React.useEffect(() => {
		if (bookmark && isOpen) {
			form.setFieldValue("url", bookmark.url || "");
			form.setFieldValue("title", bookmark.title || "");
			form.setFieldValue("tags", bookmark.tags || []);
			form.setFieldValue(
				"collections",
				bookmark.collectionId ? [bookmark.collectionId] : ["inbox"],
			);
		}
	}, [bookmark, isOpen, form]);

	if (!bookmark) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Edit Bookmark</DialogTitle>
					<DialogDescription>Update your bookmark details</DialogDescription>
				</DialogHeader>
				<View className="gap-4 py-4">
					<form.Field
						name="url"
						validators={{
							onChange: editBookmarkSchema.shape.url,
						}}
					>
						{(field) => (
							<View>
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									value={field.state.value}
									onChangeText={(text) => field.handleChange(text)}
									placeholder="https://example.com"
									editable={!isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<Text className="mt-1 text-red-500 text-xs">
										{String(field.state.meta.errors[0])}
									</Text>
								)}
							</View>
						)}
					</form.Field>

					<form.Field
						name="title"
						validators={{
							onChange: editBookmarkSchema.shape.title,
						}}
					>
						{(field) => (
							<View>
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									value={field.state.value}
									onChangeText={(text) => field.handleChange(text)}
									placeholder="Bookmark title"
									editable={!isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<Text className="mt-1 text-red-500 text-xs">
										{String(field.state.meta.errors[0])}
									</Text>
								)}
							</View>
						)}
					</form.Field>

					<form.Field name="tags">
						{(field) => (
							<View>
								<Label htmlFor="tags">Tags</Label>
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
							</View>
						)}
					</form.Field>

					<form.Field name="collections">
						{(field) => (
							<View>
								<Label htmlFor="collections">Collection</Label>
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
					</form.Field>
				</View>

				<DialogFooter>
					<Button variant="outline" onPress={onClose} disabled={isSubmitting}>
						<Text>Cancel</Text>
					</Button>
					<Button onPress={form.handleSubmit} disabled={isSubmitting}>
						<Text className="text-primary-foreground">
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
