// @packages/hooks/src/use-highlights.ts

import { useReaderStore } from "@packages/store";
import { useMemo } from "react";

/**
 * Hook for accessing highlights, optionally filtered to one article.
 */
export function useHighlights(articleId?: string) {
	const allHighlights = useReaderStore((s) => s.highlights);

	const highlights = useMemo(
		() =>
			articleId
				? allHighlights.filter((h) => h.articleId === articleId)
				: allHighlights,
		[allHighlights, articleId],
	);

	const addHighlight = useReaderStore((s) => s.addHighlight);
	const removeHighlight = useReaderStore((s) => s.removeHighlight);
	const addAnnotation = useReaderStore((s) => s.addAnnotation);
	const removeAnnotation = useReaderStore((s) => s.removeAnnotation);

	return {
		highlights,
		addHighlight,
		removeHighlight,
		addAnnotation,
		removeAnnotation,
	};
}