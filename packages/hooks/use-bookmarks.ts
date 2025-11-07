import { useMemo } from "react";
import type { Bookmark, ReaderState } from "@packages/store";
import type { UseBoundStore, StoreApi } from "zustand";

// Define the factory function that accepts the specific store hook (which includes persistence)
export const createUseBookmarks = (
  useStore: UseBoundStore<StoreApi<ReaderState>>
) => {
  return (collectionId: string = "all") => {
    const { bookmarks, setBookmarks } = useStore();

    const filteredBookmarks = useMemo(() => {
      if (collectionId === "all") {
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
      setBookmarks(
        bookmarks.map((b) => (b.id === id ? { ...b, liked: !b.liked } : b))
      );
    };

    const toggleSave = (id: string) => {
      setBookmarks(
        bookmarks.map((b) => (b.id === id ? { ...b, saved: !b.saved } : b))
      );
    };

    const removeBookmark = (id: string) => {
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    };

    const addBookmark = (data: {
      url: string;
      title: string;
      tags: string[];
      collectionId: string;
    }) => {
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(), // Use a unique ID generator
        url: data.url,
        title: data.title,
        tags: data.tags,
        collectionId: data.collectionId,
        liked: false,
        saved: false,
        createdAt: new Date().toISOString(),
      };
      setBookmarks([...bookmarks, newBookmark]);
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
