;

import { Button } from "@workspace/ui/components/button";
import { Send, X } from "lucide-react";
import { useState } from "react";

interface Annotation {
	id: string;
	text: string;
	highlightedText: string;
	timestamp: string;
}

interface AnnotationPanelProps {
	isOpen: boolean;
	onClose: () => void;
	highlightedText: string;
	onSave: (annotation: string) => void;
	annotations: Annotation[];
	onDeleteAnnotation: (id: string) => void;
}

export default function AnnotationPanel({
	isOpen,
	onClose,
	highlightedText,
	onSave,
	annotations,
	onDeleteAnnotation,
}: AnnotationPanelProps) {
	const [annotationText, setAnnotationText] = useState("");

	const handleSave = () => {
		if (annotationText.trim()) {
			onSave(annotationText);
			setAnnotationText("");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
			<div className="flex max-h-96 w-full max-w-md flex-col rounded-lg border border-border bg-card shadow-lg">
				{/* Header */}
				<div className="flex items-center justify-between border-border border-b p-4">
					<h3 className="font-semibold text-foreground">Add Annotation</h3>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Highlighted Text */}
				{highlightedText && (
					<div className="border-border border-b bg-muted/50 p-4">
						<p className="mb-2 text-muted-foreground text-xs">
							Highlighted text:
						</p>
						<p className="line-clamp-2 text-foreground text-sm italic">
							"{highlightedText}"
						</p>
					</div>
				)}

				{/* Annotation Input */}
				<div className="flex-1 space-y-3 overflow-y-auto p-4">
					<textarea
						value={annotationText}
						onChange={(e) => setAnnotationText(e.target.value)}
						placeholder="Add your thoughts, notes, or questions..."
						className="h-24 w-full resize-none rounded-md bg-muted p-3 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
					/>

					{/* Previous Annotations */}
					{annotations.length > 0 && (
						<div className="space-y-2">
							<p className="font-semibold text-muted-foreground text-xs">
								Previous annotations:
							</p>
							{annotations.map((annotation) => (
								<div
									key={annotation.id}
									className="space-y-1 rounded bg-muted/50 p-2 text-sm"
								>
									<div className="flex items-start justify-between gap-2">
										<p className="flex-1 text-foreground">{annotation.text}</p>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 flex-shrink-0"
											onClick={() => onDeleteAnnotation(annotation.id)}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
									<p className="text-muted-foreground text-xs">
										{annotation.timestamp}
									</p>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex gap-2 border-border border-t p-4">
					<Button
						variant="outline"
						onClick={onClose}
						className="flex-1 bg-transparent"
					>
						Cancel
					</Button>
					<Button onClick={handleSave} className="flex-1 gap-2">
						<Send className="h-4 w-4" />
						Save
					</Button>
				</div>
			</div>
		</div>
	);
}
