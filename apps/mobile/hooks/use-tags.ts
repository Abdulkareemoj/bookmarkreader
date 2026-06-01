import type { Option } from "@/components/ui/multi-select";
import { useReaderStore } from "@/lib/store";
import { useMemo } from "react";

export function useTags() {
	const { bookmarks } = useReaderStore((state) => state);

	const tagOptions = useMemo<Option[]>(() => {
		const allTags = new Set<string>();
		bookmarks.forEach((bookmark) => {
			if (bookmark.tags && Array.isArray(bookmark.tags)) {
				bookmark.tags.forEach((tag) => {
					if (tag && typeof tag === "string") {
						allTags.add(tag);
					}
				});
			}
		});
		return Array.from(allTags)
			.sort((a, b) => a.localeCompare(b))
			.map((tag) => ({ value: tag, label: tag }));
	}, [bookmarks]);

	const uniqueTags = useMemo(() => tagOptions.map((o) => o.value), [tagOptions]);

	return { tagOptions, uniqueTags };
}
