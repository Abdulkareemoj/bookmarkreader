import { useMemo } from "react";
import type { Option } from "@/components/ui/multi-select";
import { useReaderStore } from "@/lib/store";

export function useTags() {
	const { bookmarks } = useReaderStore((state) => state);

	// Extract unique tags from all bookmarks and convert to Option format
	const tagOptions = useMemo(() => {
		const allTags = new Set<string>();

		// Collect all unique tags from bookmarks
		bookmarks.forEach((bookmark) => {
			if (bookmark.tags && Array.isArray(bookmark.tags)) {
				bookmark.tags.forEach((tag) => {
					if (tag && typeof tag === "string") {
						allTags.add(tag);
					}
				});
			}
		});

		// Convert to Option format for MultipleSelector
		const options: Option[] = Array.from(allTags)
			.sort((a, b) => a.localeCompare(b)) // Sort alphabetically
			.map((tag) => ({
				value: tag,
				label: tag,
			}));

		return options;
	}, [bookmarks]);

	// Get all unique tags as simple string array
	const uniqueTags = useMemo(() => {
		return tagOptions.map((option) => option.value);
	}, [tagOptions]);

	// Get tag frequency (how many bookmarks use each tag)
	const tagFrequency = useMemo(() => {
		const frequency: Record<string, number> = {};

		bookmarks.forEach((bookmark) => {
			if (bookmark.tags && Array.isArray(bookmark.tags)) {
				bookmark.tags.forEach((tag) => {
					if (tag && typeof tag === "string") {
						frequency[tag] = (frequency[tag] || 0) + 1;
					}
				});
			}
		});

		return frequency;
	}, [bookmarks]);

	// Get most popular tags (sorted by frequency)
	const popularTags = useMemo(() => {
		return Object.entries(tagFrequency)
			.sort(([, a], [, b]) => b - a) // Sort by frequency (descending)
			.map(([tag]) => tag);
	}, [tagFrequency]);

	// Function to add a new tag to the system
	const addNewTag = (newTag: string): Option => {
		const trimmedTag = newTag.trim();
		if (!trimmedTag) return null;

		// Check if tag already exists
		const existingTag = tagOptions.find(
			(option) => option.value.toLowerCase() === trimmedTag.toLowerCase(),
		);

		if (existingTag) {
			return existingTag;
		}

		// Create new tag option
		return {
			value: trimmedTag,
			label: trimmedTag,
		};
	};

	return {
		tagOptions,
		uniqueTags,
		tagFrequency,
		popularTags,
		addNewTag,
	};
}
