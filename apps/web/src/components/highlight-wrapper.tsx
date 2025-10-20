import type React from "react";

import { useCallback, useRef, useState } from "react";
import AnnotationPanel from "@/components/annotation-panel";
import HighlightMenu from "@/components/highlight-menu";

interface Highlight {
	id: string;
	text: string;
	color: string;
	annotation?: string;
}

interface Annotation {
	id: string;
	text: string;
	highlightedText: string;
	timestamp: string;
}

interface HighlightWrapperProps {
	children: React.ReactNode;
	onHighlightsChange?: (highlights: Highlight[]) => void;
}

export default function HighlightWrapper({
	children,
	onHighlightsChange,
}: HighlightWrapperProps) {
	const [highlights, setHighlights] = useState<Highlight[]>([]);
	const [annotations, setAnnotations] = useState<Annotation[]>([]);
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
			const newHighlight: Highlight = {
				id: `highlight-${Date.now()}`,
				text: selectedText,
				color,
			};
			setHighlights([...highlights, newHighlight]);
			setCurrentHighlightId(newHighlight.id);
			onHighlightsChange?.([...highlights, newHighlight]);
			setMenuPosition(null);
			window.getSelection()?.removeAllRanges();
		}
	};

	const handleAnnotate = () => {
		setShowAnnotationPanel(true);
	};

	const handleSaveAnnotation = (annotationText: string) => {
		if (currentHighlightId) {
			const newAnnotation: Annotation = {
				id: `annotation-${Date.now()}`,
				text: annotationText,
				highlightedText: selectedText,
				timestamp: new Date().toLocaleString(),
			};
			setAnnotations([...annotations, newAnnotation]);
			setShowAnnotationPanel(false);
		}
	};

	const handleDeleteHighlight = () => {
		if (currentHighlightId) {
			setHighlights(highlights.filter((h) => h.id !== currentHighlightId));
			setMenuPosition(null);
		}
	};

	const handleDeleteAnnotation = (id: string) => {
		setAnnotations(annotations.filter((a) => a.id !== id));
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
				annotations={annotations}
				onDeleteAnnotation={handleDeleteAnnotation}
			/>

			{/* Render highlights */}
			<div className="pointer-events-none absolute inset-0">
				{highlights.map((highlight) => (
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
