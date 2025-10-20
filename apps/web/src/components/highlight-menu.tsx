;

import { Button } from "@workspace/ui/components/button";
import { MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface HighlightMenuProps {
	position: { x: number; y: number } | null;
	onHighlight: (color: string) => void;
	onAnnotate: () => void;
	onDelete: () => void;
}

export default function HighlightMenu({
	position,
	onHighlight,
	onAnnotate,
	onDelete,
}: HighlightMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (position && menuRef.current) {
			menuRef.current.style.left = `${position.x}px`;
			menuRef.current.style.top = `${position.y}px`;
		}
	}, [position]);

	if (!position) return null;

	const highlightColors = [
		{ name: "Yellow", value: "bg-yellow-200/40" },
		{ name: "Green", value: "bg-green-200/40" },
		{ name: "Blue", value: "bg-blue-200/40" },
		{ name: "Pink", value: "bg-pink-200/40" },
	];

	return (
		<div
			ref={menuRef}
			className="fixed z-50 flex gap-1 rounded-lg border border-border bg-card p-2 shadow-lg"
			style={{ transform: "translate(-50%, -100%)" }}
		>
			<div className="flex items-center gap-1">
				{highlightColors.map((color) => (
					<Button
						key={color.value}
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onHighlight(color.value)}
						title={`Highlight ${color.name}`}
					>
						<div
							className={`h-4 w-4 rounded ${color.value} border border-border`}
						/>
					</Button>
				))}
			</div>

			<div className="w-px bg-border" />

			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				onClick={onAnnotate}
				title="Add annotation"
			>
				<MessageSquare className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 hover:text-destructive"
				onClick={onDelete}
				title="Remove highlight"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
