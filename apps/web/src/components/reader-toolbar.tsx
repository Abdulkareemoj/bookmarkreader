import { Download, Highlighter, MessageSquare, Tag } from "lucide-react";
import { useState } from "react";
import ActionButton from "@/components/action-button";

interface ReaderToolbarProps {
	onHighlightToggle?: (enabled: boolean) => void;
	onTagsToggle?: (enabled: boolean) => void;
	onNotesToggle?: (enabled: boolean) => void;
	onExport?: () => void;
}

export default function ReaderToolbar({
	onHighlightToggle,
	onTagsToggle,
	onNotesToggle,
	onExport,
}: ReaderToolbarProps) {
	const [highlightEnabled, setHighlightEnabled] = useState(true);
	const [tagsEnabled, setTagsEnabled] = useState(true);
	const [notesEnabled, setNotesEnabled] = useState(true);

	return (
		<div className="sticky top-16 z-30 border-border border-b bg-background px-4 py-3 md:px-6">
			<div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
				<ActionButton
					icon={Highlighter}
					label="Highlight"
					size="sm"
					active={highlightEnabled}
					onClick={() => {
						setHighlightEnabled(!highlightEnabled);
						onHighlightToggle?.(!highlightEnabled);
					}}
				/>
				<ActionButton
					icon={Tag}
					label="Tags"
					size="sm"
					active={tagsEnabled}
					onClick={() => {
						setTagsEnabled(!tagsEnabled);
						onTagsToggle?.(!tagsEnabled);
					}}
				/>
				<ActionButton
					icon={MessageSquare}
					label="Notes"
					size="sm"
					active={notesEnabled}
					onClick={() => {
						setNotesEnabled(!notesEnabled);
						onNotesToggle?.(!notesEnabled);
					}}
				/>
				<div className="flex-1" />
				<ActionButton
					icon={Download}
					label="Export"
					size="sm"
					onClick={onExport}
				/>
			</div>
		</div>
	);
}
