import { useReaderStore } from "@/lib/store"

export function useBookmarks(collectionId?: string) {
  const allBookmarks = useReaderStore((state) => state.bookmarks)
  const bookmarks = collectionId ? allBookmarks.filter((b) => b.collectionId === collectionId) : allBookmarks

  const addBookmark = useReaderStore((state) => state.addBookmark)
  const removeBookmark = useReaderStore((state) => state.removeBookmark)
  const toggleLike = useReaderStore((state) => state.toggleBookmarkLike)
  const toggleSave = useReaderStore((state) => state.toggleBookmarkSave)

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleLike,
    toggleSave,
  }
}
