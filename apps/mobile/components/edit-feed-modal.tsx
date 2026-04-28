import * as React from "react";
import { View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Check, Trash2 } from "lucide-react-native";
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

const editFeedSchema = z.object({
	title: z.string().min(1, "Title is required"),
	feedUrl: z.url("Please enter a valid RSS feed URL").min(1, "URL is required").refine(
			(url) => {
				try {
					const urlObj = new URL(url);
					return urlObj.hostname.includes(".");
				} catch {
					return false;
				}
			},
			"Please enter a valid domain (e.g., https://example.com/feed.xml)"
		),
});

interface EditFeedModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	feed: {
		id: string;
		title: string;
		feedUrl: string;
	} | null;
	onSave: (id: string, data: { title: string; feedUrl: string }) => void;
	onDelete: (id: string) => void;
}

export function EditFeedModal({
	open,
	onOpenChange,
	feed,
	onSave,
	onDelete,
}: EditFeedModalProps) {
	const form = useForm({
		defaultValues: {
			title: feed?.title || "",
			feedUrl: feed?.feedUrl || "",
		},
		validators: {
			onChange: ({ value }) => {
				const result = editFeedSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
			onSubmit: ({ value }) => {
				const result = editFeedSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
		},
		onSubmit: async ({ value }) => {
			if (feed) {
				onSave(feed.id, { title: value.title, feedUrl: value.feedUrl });
				form.reset();
				onOpenChange(false);
			}
		},
	});

	// Reset form when feed changes
	React.useEffect(() => {
		if (feed) {
			form.setFieldValue("title", feed.title);
			form.setFieldValue("feedUrl", feed.feedUrl);
		}
	}, [feed, form]);

	const handleDelete = () => {
		if (feed) {
			onDelete(feed.id);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Feed</DialogTitle>
					<DialogDescription>
						Update the feed title or remove it from your subscriptions.
					</DialogDescription>
				</DialogHeader>

				<View className="gap-4 py-4">
					<form.Field
						name="feedUrl"
						children={(field) => (
							<View className="gap-2">
								<Label nativeID="url-label">Feed URL</Label>
								<Input
									placeholder="https://example.com/feed.xml"
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
									placeholder="Feed title"
									value={field.state.value}
									onChangeText={field.handleChange}
									onBlur={field.handleBlur}
									autoCapitalize="words"
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
					<View className="flex flex-col gap-2 w-full">
						<form.Subscribe
							selector={(state) => ({
								values: state.values,
								isSubmitting: state.isSubmitting,
							})}
							children={(state) => (
								<Button
									onPress={() => form.handleSubmit()}
									disabled={state.values.title.trim() === "" || state.isSubmitting}
									className="w-full"
								>
									<Check size={18} color="white" className="mr-2" />
									<Text className="font-semibold text-white">Save Changes</Text>
								</Button>
							)}
						/>

						<Button
							onPress={handleDelete}
							variant="destructive"
							className="w-full"
						>
							<Trash2 size={18} color="white" className="mr-2" />
							<Text className="font-semibold text-white">Remove Feed</Text>
						</Button>
					</View>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
