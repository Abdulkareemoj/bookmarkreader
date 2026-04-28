import * as React from "react";
import { View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

// Define the form schema with Zod
const feedSchema = z.object({
	feedUrl: z.url("Please enter a valid RSS feed URL").min(1, "URL is required").refine(
			(url) => {
				try {
					const urlObj = new URL(url);
					// Ensure the URL has a valid domain
					return urlObj.hostname.includes(".");
				} catch {
					return false;
				}
			},
			"Please enter a valid domain (e.g., https://example.com/feed.xml)"
		),
	title: z.string().optional(),
});

interface AddFeedModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onAddFeed: (data: {
		feedUrl: string;
		title?: string;
	}) => void;
}

export function AddFeedModal({ open, onOpenChange, onAddFeed }: AddFeedModalProps) {
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const setOpen = (value: boolean) => {
		if (isControlled) {
			onOpenChange?.(value);
		} else {
			setInternalOpen(value);
		}
	};

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
			open={isOpen}
			onOpenChange={setOpen}
		>
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
