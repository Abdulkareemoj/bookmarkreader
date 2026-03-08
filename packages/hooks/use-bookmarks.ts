import { useMemo } from "react";
import type { Bookmark, ReaderState } from "@packages/store";
import type { UseBoundStore, StoreApi } from "zustand";

// Define the factory function that accepts the specific store hook (which includes persistence)
export const createUseBookmarks = (
  useStore: UseBoundStore<StoreApi<ReaderState>>
) => {
  return (collectionId: string = "all") => {
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
