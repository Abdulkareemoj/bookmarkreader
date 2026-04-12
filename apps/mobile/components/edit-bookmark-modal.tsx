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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useCollectionsStore } from "@/lib/store";

const editBookmarkSchema = z.object({
	url: z.url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	tags: z.array(z.string()).default([]),
	collectionId: z.string().default("inbox"),
});

interface EditBookmarkModalProps {
	bookmark: Bookmark | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdate: (data: Partial<Bookmark>) => void;
}

export function EditBookmarkModal({
	bookmark,
	isOpen,
	onClose,
	onUpdate,
}: EditBookmarkModalProps) {
	const { bookmarkCollections } = useCollectionsStore();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const form = useForm({
		defaultValues: {
			url: bookmark?.url || "",
			title: bookmark?.title || "",
			tags: bookmark?.tags || [],
			collectionId: bookmark?.collectionId || "inbox",
		},
		onSubmit: async ({ value }) => {
			if (!bookmark) return;

			setIsSubmitting(true);
			try {
				// Update the bookmark via the store
				onUpdate({
					url: value.url,
					title: value.title,
					tags: value.tags,
					collectionId: value.collectionId,
				});

				onClose();
			} catch (error) {
				console.error("Failed to update bookmark:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Update form when bookmark changes
	React.useEffect(() => {
		if (bookmark) {
			form.setFieldValue("url", bookmark.url);
			form.setFieldValue("title", bookmark.title);
			form.setFieldValue("tags", bookmark.tags || []);
			form.setFieldValue("collectionId", bookmark.collectionId || "inbox");
		}
	}, [bookmark, form]);

	if (!bookmark) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Bookmark</DialogTitle>
					<DialogDescription>Update your bookmark details</DialogDescription>
				</DialogHeader>

				<View className="space-y-4">
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
										{field.state.meta.errors[0]}
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
										{field.state.meta.errors[0]}
									</Text>
								)}
							</View>
						)}
					</form.Field>

					<form.Field name="tags">
						{(field) => (
							<View>
								<Label htmlFor="tags">Tags</Label>
								<Text className="text-muted-foreground">
									Tags: {field.state.value.join(", ")}
								</Text>
								<Text className="text-muted-foreground text-xs">
									(Tag editing coming soon)
								</Text>
							</View>
						)}
					</form.Field>

					<form.Field name="collectionId">
						{(field) => (
							<View>
								<Label htmlFor="collection">Collection</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
									disabled={isSubmitting}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select collection" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{bookmarkCollections.map((collection) => (
												<SelectItem key={collection.id} value={collection.id}>
													{collection.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
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
