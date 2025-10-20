
import { Button } from "@workspace/ui/components/button";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import ActionButton from "@/components/action-button";
import AnnotationPanel from "@/components/annotation-panel";
import HighlightMenu from "@/components/highlight-menu";
import TagPill from "@/components/tag-pill";
import { cn } from "@/lib/utils";

interface Highlight {
	id: string;
	text: string;
	color: string;
	annotations: Array<{ id: string; text: string; timestamp: string }>;
}

interface ArticleDisplayProps {
	id: string;
	title: string;
	subtitle: string;
	category: string;
	readTime: number;
	author: string;
	authorImage?: string;
	date: string;
	content: string;
	tags?: string[];
	liked?: boolean;
	saved?: boolean;
	onLike?: () => void;
	onSave?: () => void;
	onShare?: () => void;
	onComment?: () => void;
}

export default function ArticleDisplay({
	id,
	title,
	subtitle,
	category,
	readTime,
	author,
	authorImage,
	date,
	content,
	tags = [],
	liked = false,
	saved = false,
	onLike,
	onSave,
	onShare,
	onComment,
}: ArticleDisplayProps) {
	const [highlights, setHighlights] = useState<Highlight[]>([]);
	const [selectedText, setSelectedText] = useState<string>("");
	const [menuPosition, setMenuPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [annotationPanelOpen, setAnnotationPanelOpen] = useState(false);
	const [currentHighlightId, setCurrentHighlightId] = useState<string | null>(
		null,
	);

	const handleTextSelection = () => {
		const selection = window.getSelection();
		if (selection && selection.toString().length > 0) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			setSelectedText(selection.toString());
			setMenuPosition({
				x: rect.left + rect.width / 2,
				y: rect.top,
			});
		}
	};

	const handleHighlight = (color: string) => {
		if (selectedText) {
			const newHighlight: Highlight = {
				id: Date.now().toString(),
				text: selectedText,
				color,
				annotations: [],
			};
			setHighlights([...highlights, newHighlight]);
			setCurrentHighlightId(newHighlight.id);
			setMenuPosition(null);
			window.getSelection()?.removeAllRanges();
		}
	};

	const handleAnnotate = () => {
		if (currentHighlightId) {
			setAnnotationPanelOpen(true);
		}
	};

	const handleSaveAnnotation = (annotationText: string) => {
		if (currentHighlightId) {
			setHighlights(
				highlights.map((h) =>
					h.id === currentHighlightId
						? {
								...h,
								annotations: [
									...h.annotations,
									{
										id: Date.now().toString(),
										text: annotationText,
										timestamp: new Date().toLocaleString(),
									},
								],
							}
						: h,
				),
			);
			setAnnotationPanelOpen(false);
		}
	};

	const handleDeleteAnnotation = (annotationId: string) => {
		if (currentHighlightId) {
			setHighlights(
				highlights.map((h) =>
					h.id === currentHighlightId
						? {
								...h,
								annotations: h.annotations.filter((a) => a.id !== annotationId),
							}
						: h,
				),
			);
		}
	};

	const handleDeleteHighlight = () => {
		setHighlights(highlights.filter((h) => h.id !== currentHighlightId));
		setMenuPosition(null);
		setCurrentHighlightId(null);
	};

	const currentHighlight = highlights.find((h) => h.id === currentHighlightId);

	return (
		<article className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
			{/* Article Header */}
			<div className="mb-8 space-y-6">
				{/* Category and Read Time */}
				<div className="flex flex-wrap items-center gap-3">
					<TagPill label={category} variant="primary" />
					<span className="text-muted-foreground text-sm">
						{readTime} min read
					</span>
				</div>

				{/* Title */}
				<div className="space-y-3">
					<h1 className="text-balance font-bold text-4xl text-foreground leading-tight md:text-5xl">
						{title}
					</h1>
					<p className="text-pretty text-muted-foreground text-xl leading-relaxed">
						{subtitle}
					</p>
				</div>

				{/* Author and Meta */}
				<div className="flex items-center justify-between border-border border-t border-b py-4">
					<div className="flex items-center gap-3">
						{authorImage ? (
							<img
								src={authorImage || "/placeholder.svg"}
								alt={author}
								className="h-12 w-12 rounded-full object-cover"
							/>
						) : (
							<div className="h-12 w-12 rounded-full bg-primary/20" />
						)}
						<div>
							<p className="font-semibold text-foreground">{author}</p>
							<p className="text-muted-foreground text-sm">{date}</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={onLike}
							title={liked ? "Unlike" : "Like"}
							className="hover:text-red-500"
						>
							<Heart
								className={cn("h-5 w-5", liked && "fill-current text-red-500")}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={onSave}
							title={saved ? "Remove from saved" : "Save for later"}
						>
							<Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
						</Button>
						<Button variant="ghost" size="icon" onClick={onShare} title="Share">
							<Share2 className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			{/* Article Content */}
			<div className="prose prose-invert mb-8 max-w-none space-y-6 text-foreground">
				<div
					className="space-y-6 transition-colors"
					onMouseUp={handleTextSelection}
				>
					{/* Parse and render content with proper formatting */}
					{content.split("\n\n").map((paragraph, idx) => {
						if (paragraph.startsWith("##")) {
							return (
								<h2
									key={idx}
									className="mt-8 mb-4 font-bold text-2xl text-foreground"
								>
									{paragraph.replace("##", "").trim()}
								</h2>
							);
						}
						if (paragraph.startsWith("- ")) {
							const items = paragraph
								.split("\n")
								.filter((item) => item.startsWith("- "));
							return (
								<ul key={idx} className="ml-6 space-y-3">
									{items.map((item, itemIdx) => (
										<li key={itemIdx} className="flex gap-3">
											<span className="flex-shrink-0 font-bold text-primary">
												•
											</span>
											<span>{item.replace("- ", "").trim()}</span>
										</li>
									))}
								</ul>
							);
						}
						return (
							<p key={idx} className="text-lg leading-relaxed">
								{paragraph}
							</p>
						);
					})}
				</div>
			</div>

			{/* Highlights Summary */}
			{highlights.length > 0 && (
				<div className="mb-6 border-border border-t py-6">
					<p className="mb-3 font-semibold text-muted-foreground text-sm">
						Highlights ({highlights.length})
					</p>
					<div className="space-y-2">
						{highlights.map((highlight) => (
							<div
								key={highlight.id}
								className={cn("rounded-md border p-3", highlight.color)}
							>
								<p className="text-foreground text-sm italic">
									"{highlight.text}"
								</p>
								{highlight.annotations.length > 0 && (
									<div className="mt-2 space-y-1">
										{highlight.annotations.map((annotation) => (
											<p
												key={annotation.id}
												className="text-muted-foreground text-xs"
											>
												💬 {annotation.text}
											</p>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Tags Section */}
			{tags.length > 0 && (
				<div className="border-border border-t py-6">
					<p className="mb-3 font-semibold text-muted-foreground text-sm">
						Tags
					</p>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<TagPill key={tag} label={tag} variant="secondary" />
						))}
					</div>
				</div>
			)}

			{/* Article Actions */}
			<div className="flex flex-wrap gap-3 border-border border-t pt-8">
				<ActionButton
					icon={Heart}
					label={liked ? "Liked" : "Like"}
					variant={liked ? "default" : "outline"}
					active={liked}
					onClick={onLike}
				/>
				<ActionButton
					icon={Bookmark}
					label={saved ? "Saved" : "Save"}
					variant={saved ? "default" : "outline"}
					active={saved}
					onClick={onSave}
				/>
				<ActionButton
					icon={Share2}
					label="Share"
					variant="outline"
					onClick={onShare}
				/>
				<ActionButton
					icon={MessageCircle}
					label="Comment"
					variant="outline"
					onClick={onComment}
				/>
			</div>

			<HighlightMenu
				position={menuPosition}
				onHighlight={handleHighlight}
				onAnnotate={handleAnnotate}
				onDelete={handleDeleteHighlight}
			/>

			<AnnotationPanel
				isOpen={annotationPanelOpen}
				onClose={() => setAnnotationPanelOpen(false)}
				highlightedText={currentHighlight?.text || ""}
				onSave={handleSaveAnnotation}
				annotations={currentHighlight?.annotations || []}
				onDeleteAnnotation={handleDeleteAnnotation}
			/>
		</article>
	);
}
