import {
	ArrowLeft,
	Bookmark,
	Heart,
	MessageCircle,
	Share2,
} from "lucide-react";
import { useState } from "react";
import ActionButton from "@/components/action-button";
import AnnotationPanel from "@/components/annotation-panel";
import HighlightMenu from "@/components/rss/highlight-menu";
import TagPill from "@/components/tag-pill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHighlights } from "@/hooks/use-highlights";
import type { Highlight } from "@packages/store";
import ArticleRenderer from "./article-renderer";

interface ArticleDisplayProps {
	id: string;
	articleId?: string;
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
	articleId = id,
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
	const {
		highlights,
		addHighlight,
		removeHighlight,
		addAnnotation,
		removeAnnotation,
	} = useHighlights(articleId);
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
		if (currentHighlightId) {
			setAnnotationPanelOpen(true);
		}
	};

	const handleSaveAnnotation = (annotationText: string) => {
		if (currentHighlightId) {
			addAnnotation(currentHighlightId, {
				id: `ann-${Date.now()}`,
				text: annotationText,
				timestamp: new Date().toISOString(),
			});
			setAnnotationPanelOpen(false);
		}
	};

	const handleDeleteAnnotation = (annotationId: string) => {
		if (currentHighlightId) {
			removeAnnotation(currentHighlightId, annotationId);
		}
	};

	const handleDeleteHighlight = () => {
		if (currentHighlightId) {
			removeHighlight(currentHighlightId);
			setMenuPosition(null);
			setCurrentHighlightId(null);
		}
	};

	const currentHighlight = highlights.find((h) => h.id === currentHighlightId);

	return (
		<main>
			<article className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
				{/* Article Header */}
				<div className="mb-8 flex flex-col gap-6">
					<Button
						variant="outline"
						size="sm"
						onClick={() => window.history.back()}
						className="mb-6 inline-flex items-center"
					>
						<ArrowLeft data-icon="inline-start" />
						Back
					</Button>
					{/* Category and Read Time */}
					<div className="flex gap-3">
						<TagPill label={category} variant="primary" />
						<span className="text-muted-foreground text-sm">
							{readTime} min read
						</span>
					</div>
					{/* Title */}
					<div className="flex flex-col gap-3">
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
									className="size-12 rounded-full object-cover"
								/>
							) : (
								<div className="size-12 rounded-full bg-primary/20" />
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
								<div className="t-icon-swap" data-state={liked ? "b" : "a"}>
									<Heart data-icon="a" className="t-icon" />
									<Heart
										data-icon="b"
										className="t-icon fill-current text-red-500"
									/>
								</div>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={onSave}
								title={saved ? "Remove from saved" : "Save for later"}
							>
								<div className="t-icon-swap" data-state={saved ? "b" : "a"}>
									<Bookmark data-icon="a" className="t-icon" />
									<Bookmark data-icon="b" className="t-icon fill-current" />
								</div>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={onShare}
								title="Share"
							>
								<Share2 data-icon="inline-start" />
							</Button>
						</div>
					</div>
				</div>

				{/* Article Content */}
				<div onMouseUp={handleTextSelection}>
					<ArticleRenderer content={content} />
				</div>

				{/* Highlights Summary */}
				{highlights.length > 0 && (
					<div className="mb-6 border-border border-t py-6">
						<p className="mb-3 font-semibold text-muted-foreground text-sm">
							Highlights ({highlights.length})
						</p>
						<div className="flex flex-col gap-2">
							{highlights.map((highlight: Highlight) => (
								<div
									key={highlight.id}
									className={cn("rounded-md border p-3", highlight.color)}
								>
									<p className="text-foreground text-sm italic">
										"{highlight.text}"
									</p>
									{highlight.annotations.length > 0 && (
										<div className="mt-2 flex flex-col gap-1">
											{highlight.annotations.map(
												(annotation: {
													id: string;
													text: string;
													timestamp: string;
												}) => (
													<p
														key={annotation.id}
														className="text-muted-foreground text-xs"
													>
														💬 {annotation.text}
													</p>
												),
											)}
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
		</main>
	);
}
