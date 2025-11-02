import { create } from "zustand";

export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  annotations: Array<{ id: string; text: string; timestamp: string }>;
}

export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  tags: string[];
  collectionId: string;
}

export interface ReaderState {
  // Highlights
  highlights: Highlight[];
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  addAnnotation: (
    highlightId: string,
    annotation: { id: string; text: string; timestamp: string }
  ) => void;
  removeAnnotation: (highlightId: string, annotationId: string) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;

  // Reader preferences
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const createReaderStore = (set: any) => ({
  // Highlights
  highlights: [],
  addHighlight: (highlight: Highlight) =>
    set((state: ReaderState) => ({
      highlights: [...state.highlights, highlight],
    })),
  removeHighlight: (id: string) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),
  addAnnotation: (
    highlightId: string,
    annotation: { id: string; text: string; timestamp: string }
  ) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId
          ? { ...h, annotations: [...h.annotations, annotation] }
          : h
      ),
    })),
  removeAnnotation: (highlightId: string, annotationId: string) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId
          ? {
              ...h,
              annotations: h.annotations.filter((a) => a.id !== annotationId),
            }
          : h
      ),
    })),

  // Bookmarks
  bookmarks: [],
  addBookmark: (bookmark: Bookmark) =>
    set((state: ReaderState) => ({
      bookmarks: [...state.bookmarks, bookmark],
    })),
  removeBookmark: (id: string) =>
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    })),

  // Reader preferences
  theme: "dark" as "light" | "dark",
  setTheme: (theme: "light" | "dark") => set({ theme }),
});
