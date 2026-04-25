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
import { Text } from "@/components/ui/text";

// Define the form schema with Zod
const feedSchema = z.object({
	feedUrl: z.string().url("Please enter a valid RSS feed URL"),
	title: z.string().optional(),
});

interface AddFeedModalProps {
	onAddFeed: (data: {
		feedUrl: string;
		title?: string;
	}) => void;
}

export function AddFeedModal({ onAddFeed }: AddFeedModalProps) {
	const [open, setOpen] = React.useState(false);

	const form = useForm({
		defaultValues: {
			feedUrl: "",
			title: "",
		},
		validators: {
			onChange: ({ value }) => {
				const result = feedSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
			onSubmit: ({ value }) => {
				const result = feedSchema.safeParse(value);
				return result.success ? undefined : result.error.issues;
			},
		},
		onSubmit: async ({ value }) => {
			console.log("[AddFeedModal] Submitting feed:", value);
			onAddFeed(value);
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
				<Button variant="outline" className="w-full">
					<Plus size={20} color="#3b82f6" className="mr-2" />
					<Text className="font-semibold text-blue-500">Add New Feed</Text>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New RSS Feed</DialogTitle>
					<DialogDescription>
						Enter the URL of the RSS feed you want to subscribe to.
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
								<Label nativeID="title-label">Title (Optional)</Label>
								<Input
									placeholder="e.g., My Blog"
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
				</View>

				<DialogFooter>
					<form.Subscribe
						selector={(state) => ({
							values: state.values,
							isSubmitting: state.isSubmitting,
						})}
						children={(state) => (
							<Button
								onPress={() => form.handleSubmit()}
								disabled={state.values.feedUrl.trim() === "" || state.isSubmitting}
								className="mt-2 w-full"
							>
								<Text className="font-semibold text-white">
									{state.isSubmitting ? "Adding..." : "Add Feed"}
								</Text>
							</Button>
						)}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
