import { useReaderStore } from "@/lib/store"

export function useHighlights(articleId: string) {
  const highlights = useReaderStore((state) => state.highlights.filter((h) => h.articleId === articleId))
  const addHighlight = useReaderStore((state) => state.addHighlight)
  const removeHighlight = useReaderStore((state) => state.removeHighlight)
  const addAnnotation = useReaderStore((state) => state.addAnnotation)
  const removeAnnotation = useReaderStore((state) => state.removeAnnotation)

  return {
    highlights,
    addHighlight,
    removeHighlight,
    addAnnotation,
    removeAnnotation,
  }
}
