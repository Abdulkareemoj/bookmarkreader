import type { Highlight, ReaderState } from "@packages/store";
import type { UseBoundStore, StoreApi } from "zustand";

export const createUseHighlights = (
  useStore: UseBoundStore<StoreApi<ReaderState>>
) => {
  return (articleId?: string) => {
    const allHighlights = useStore((state) => state.highlights);
    const highlights = articleId
      ? allHighlights.filter((h) => h.articleId === articleId)
      : allHighlights;

    const addHighlight = useStore((state) => state.addHighlight);
    const removeHighlight = useStore((state) => state.removeHighlight);
    const addAnnotation = useStore((state) => state.addAnnotation);
    const removeAnnotation = useStore((state) => state.removeAnnotation);

    return {
      highlights,
      addHighlight,
      removeHighlight,
      addAnnotation,
      removeAnnotation,
    };
  };
};
