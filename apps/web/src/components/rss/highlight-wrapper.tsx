import type React from "react";

import { useCallback, useRef, useState } from "react";
import AnnotationPanel from "@/components/annotation-panel";
import HighlightMenu from "@/components/rss/highlight-menu";
import { useHighlights } from "@/hooks/use-highlights";
import type { Highlight } from "@packages/store";

interface HighlightWrapperProps {
	children: React.ReactNode;
	articleId: string;
}

export default function HighlightWrapper({
	children,
	articleId,
}: HighlightWrapperProps) {
	const {
		highlights,
		addHighlight,
		removeHighlight,
		addAnnotation,
		removeAnnotation,
	} = useHighlights(articleId);
	const [menuPosition, setMenuPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [selectedText, setSelectedText] = useState("");
	const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
	const [currentHighlightId, setCurrentHighlightId] = useState<string | null>(
		null,
	);
	const contentRef = useRef<HTMLDivElement>(null);

	const handleTextSelection = useCallback(() => {
		const selection = window.getSelection();
		if (selection && selection.toString().length > 0) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			setSelectedText(selection.toString());
			setMenuPosition({
				x: rect.left + rect.width / 2,
				y: rect.top,
			});
		} else {
			setMenuPosition(null);
		}
	}, []);

	const handleHighlight = (color: string) => {
		if (selectedText) {
			const newHighlight = {
				id: `hl-${Date.now()}`,
				articleId,
				text: selectedText,
				color,
				annotations: [],
			};
			addHighlight(newHighlight);
			setCurrentHighlightId(newHighlight.id);
			setMenuPosition(null);
			window.getSelection()?.removeAllRanges();
		}
	};

	const handleAnnotate = () => {
		setShowAnnotationPanel(true);
	};

	const handleSaveAnnotation = (annotationText: string) => {
		if (currentHighlightId) {
			const annotation = {
				id: `ann-${Date.now()}`,
				text: annotationText,
				timestamp: new Date().toISOString(),
			};
			addAnnotation(currentHighlightId, annotation);
			setShowAnnotationPanel(false);
		}
	};

	const handleDeleteHighlight = () => {
		if (currentHighlightId) {
			removeHighlight(currentHighlightId);
			setMenuPosition(null);
			setCurrentHighlightId(null);
		}
	};

	const handleDeleteAnnotation = (annotationId: string) => {
		if (currentHighlightId) {
			removeAnnotation(currentHighlightId, annotationId);
		}
	};

	return (
		<div ref={contentRef} onMouseUp={handleTextSelection} className="relative">
			{children}

			<HighlightMenu
				position={menuPosition}
				onHighlight={handleHighlight}
				onAnnotate={handleAnnotate}
				onDelete={handleDeleteHighlight}
			/>

			<AnnotationPanel
				isOpen={showAnnotationPanel}
				onClose={() => setShowAnnotationPanel(false)}
				highlightedText={selectedText}
				onSave={handleSaveAnnotation}
				annotations={
					highlights
						.find((h: Highlight) => h.id === currentHighlightId)
						?.annotations?.map(
							(a: { id: string; text: string; timestamp: string }) => ({
								id: a.id,
								text: a.text,
								highlightedText: selectedText,
								timestamp: a.timestamp,
							}),
						) || []
				}
				onDeleteAnnotation={handleDeleteAnnotation}
			/>

			{/* Render highlights */}
			<div className="pointer-events-none absolute inset-0">
				{highlights.map((highlight: Highlight) => (
					<div
						key={highlight.id}
						className={`inline-block ${highlight.color} rounded px-1 py-0.5 transition-opacity hover:opacity-80`}
					>
						{highlight.text}
					</div>
				))}
			</div>
		</div>
	);
}
