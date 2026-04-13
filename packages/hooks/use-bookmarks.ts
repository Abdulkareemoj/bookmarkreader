import type { ReaderState } from "@packages/store";
import { useMemo } from "react";
import type { StoreApi, UseBoundStore } from "zustand";

export const createUseBookmarks = (
	useStore: UseBoundStore<StoreApi<ReaderState>>,
) => {
	return (collectionId = "all") => {
		const { bookmarks } = useStore();
		const {
			addBookmark: addBookmarkAction,
			removeBookmark: removeBookmarkAction,
			toggleBookmarkLike,
			toggleBookmarkSave,
		} = useStore();

		const filteredBookmarks = useMemo(() => {
			if (collectionId === "all" || collectionId === "inbox") {
				return bookmarks;
			}
			if (collectionId === "liked") {
				return bookmarks.filter((b) => b.liked);
			}
			if (collectionId === "saved") {
				return bookmarks.filter((b) => b.saved);
			}
			return bookmarks.filter((b) => b.collectionId === collectionId);
		}, [bookmarks, collectionId]);

		const toggleLike = (id: string) => {
			void toggleBookmarkLike(id);
		};

		const toggleSave = (id: string) => {
			void toggleBookmarkSave(id);
		};

		const removeBookmark = (id: string) => {
			void removeBookmarkAction(id);
		};

		const addBookmark = (data: {
			url: string;
			title: string;
			tags: string[];
			collectionId: string;
		}) => {
			void addBookmarkAction(data);
		};

		return {
			bookmarks: filteredBookmarks,
			toggleLike,
			toggleSave,
			removeBookmark,
			addBookmark,
		};
	};
};
