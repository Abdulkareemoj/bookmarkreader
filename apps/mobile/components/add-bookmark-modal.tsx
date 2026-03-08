import * as React from "react";
import { View } from "react-native";
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

// Define the form schema with Zod
const bookmarkSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	title: z.string().min(1, "Title is required"),
	collectionId: z.string().min(1, "Collection is required"),
});

interface AddBookmarkModalProps {
	onAddBookmark: (data: {
		url: string;
		title: string;
		collectionId: string;
	}) => void;
}

export function AddBookmarkModal({ onAddBookmark }: AddBookmarkModalProps) {
	const [open, setOpen] = React.useState(false);
	const { bookmarkCollections } = useCollectionsStore();

	const form = useForm({
		defaultValues: {
			url: "",
			title: "",
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
			onAddBookmark(value);
			form.reset();
			setOpen(false);
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) {
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
			<DialogContent className="sm:max-w-[425px]">
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
								<Input
									placeholder="https://example.com"
									value={field.state.value}
									onChangeText={field.handleChange}
									onBlur={field.handleBlur}
									autoCapitalize="none"
									keyboardType="url"
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
						name="collectionId"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="collection-label">Collection</Label>
								<Select
									value={{
										value: field.state.value,
										label:
											bookmarkCollections.find(
												(c: { id: string; name: string }) =>
													c.id === field.state.value,
											)?.name || field.state.value,
									}}
									onValueChange={(val) => {
										if (val) {
											field.handleChange(val.value);
										}
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a collection" />
									</SelectTrigger>
									<SelectContent portalHost="modal-host">
										<SelectGroup>
											{bookmarkCollections.map((collection: { id: string; name: string }) => (
												<SelectItem
													key={collection.id}
													label={collection.name}
													value={collection.id}
												>
													{collection.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
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
