

import { useReaderStore } from "@packages/store";
import { useMemo } from "react";

/**
 * Hook for accessing bookmarks.
 * Optionally filter by collectionId: "all" | "liked" | "saved" | custom id
 */
export function useBookmarks(collectionId = "all") {
	const bookmarks = useReaderStore((s) => s.bookmarks);

	const filtered = useMemo(() => {
		if (collectionId === "all") return bookmarks;
		if (collectionId === "liked") return bookmarks.filter((b) => b.liked);
		if (collectionId === "saved") return bookmarks.filter((b) => b.saved);
		if (collectionId === "favorites")
			return bookmarks.filter((b) => b.favorite);
		return bookmarks.filter((b) => b.collectionId === collectionId);
	}, [bookmarks, collectionId]);

	const addBookmark = useReaderStore((s) => s.addBookmark);
	const updateBookmark = useReaderStore((s) => s.updateBookmark);
	const removeBookmark = useReaderStore((s) => s.removeBookmark);
	const toggleLike = useReaderStore((s) => s.toggleBookmarkLike);
	const toggleSave = useReaderStore((s) => s.toggleBookmarkSave);
	const toggleFavorite = useReaderStore((s) => s.toggleBookmarkFavorite);

	return {
		bookmarks: filtered,
		addBookmark: (data: Parameters<typeof addBookmark>[0]) =>
			void addBookmark(data),
		updateBookmark: (id: string, data: Parameters<typeof updateBookmark>[1]) =>
			void updateBookmark(id, data),
		removeBookmark: (id: string) => void removeBookmark(id),
		toggleLike: (id: string) => void toggleLike(id),
		toggleSave: (id: string) => void toggleSave(id),
		toggleFavorite: (id: string) => void toggleFavorite(id),
	};
}