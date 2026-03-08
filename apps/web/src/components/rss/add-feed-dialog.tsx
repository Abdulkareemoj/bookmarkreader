import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { useFeeds } from "@/hooks/use-feeds";

// Define the form schema with Zod
const feedSchema = z.object({
	feedUrl: z.string().url("Please enter a valid RSS feed URL"),
	title: z.string().optional(),
});

export function AddFeedDialog() {
	const { addFeed } = useFeeds();
	const [open, setOpen] = useState(false);

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
			// Create the new feed with proper URL validation
			const newFeed = {
				title: value.title || "Untitled Feed",
				feedUrl: value.feedUrl,
				siteUrl: new URL(value.feedUrl).origin,
			};

			await addFeed(newFeed);
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
				<Button variant="secondary" className="w-full">
					<Plus className="mr-2 h-4 w-4" />
					Add New Feed
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New RSS Feed</DialogTitle>
					<DialogDescription>
						Enter the URL of the RSS feed you want to subscribe to.
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
							name="feedUrl"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Feed URL</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="https://example.com/feed.xml"
											type="url"
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
											placeholder="Optional title (e.g., My Blog)"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
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
							children={(state) => (
								<Button
									type="submit"
									disabled={
										state.values.feedUrl.trim() === "" || state.isSubmitting
									}
								>
									{state.isSubmitting ? (
										<>
											<Spinner className="mr-2 h-4 w-4 animate-spin" />
											Adding...
										</>
									) : (
										"Add Feed"
									)}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
