import { create } from "zustand"
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

export interface Highlight {
  id: string
  articleId: string
  text: string
  color: string
  annotations: Array<{ id: string; text: string; timestamp: string }>
}

export interface Bookmark {
  id: string
  title: string
  subtitle: string
  category: string
  readTime: number
  author: string
  date: string
  url?: string
  tags: string[]
  collectionId: string
  saved: boolean
  liked: boolean
}

export interface ReaderState {
  highlights: Highlight[]
  addHighlight: (highlight: Highlight) => void
  removeHighlight: (id: string) => void
  addAnnotation: (highlightId: string, annotation: { id: string; text: string; timestamp: string }) => void
  removeAnnotation: (highlightId: string, annotationId: string) => void
  bookmarks: Bookmark[]
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (id: string) => void
  toggleBookmarkLike: (id: string) => void
  toggleBookmarkSave: (id: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export const useReaderStore = create<ReaderState>((set) => ({
  highlights: [],
  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [...state.highlights, highlight],
    })),
  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),
  addAnnotation: (highlightId, annotation) =>
    set((state) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId ? { ...h, annotations: [...h.annotations, annotation] } : h,
      ),
    })),
  removeAnnotation: (highlightId, annotationId) =>
    set((state) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId ? { ...h, annotations: h.annotations.filter((a) => a.id !== annotationId) } : h,
      ),
    })),
  bookmarks: [],
  addBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: [...state.bookmarks, bookmark],
    })),
  removeBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    })),
  toggleBookmarkLike: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, liked: !b.liked } : b)),
    })),
  toggleBookmarkSave: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, saved: !b.saved } : b)),
    })),
  fontSize: 16,
  setFontSize: (size) => set({ fontSize: size }),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}))
