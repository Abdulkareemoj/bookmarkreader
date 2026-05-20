import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Bookmark,
	Clock,
	ExternalLink,
	Heart,
	MoreVertical,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import HtmlParser from "react-html-parser";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useFeeds } from "@/hooks/use-feeds";


export const Route = createFileRoute("/rss/article/$id")({
	component: ArticleReaderComponent,
});

// ─── HTML cleaning ────────────────────────────────────────────────────────────

function cleanHtml(html: string): string {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
		.replace(/<form[\s\S]*?<\/form>/gi, "")
		.trim();
}

// If the content is plain text (no HTML tags), convert it to basic paragraphs
function prepareContent(raw: string): string {
	const isHtml = /<[a-z][\s\S]*?>/i.test(raw);
	if (isHtml) return cleanHtml(raw);
	// Plain text — split on double newlines into paragraphs
	return raw
		.split(/\n\n+/)
		.map((p) => `<p>${p.replace(/\n/g, " ").trim()}</p>`)
		.filter((p) => p !== "<p></p>")
		.join("\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

function ArticleReaderComponent() {
	const { id } = Route.useParams();
	const {
		articles,
		feeds,
		toggleArticleLike,
		toggleArticleSave,
		markArticleRead,
	} = useReaderStore();

	const article = articles.find((a) => a.id === id);
	const feed = article ? feeds.find((f) => f.id === article.feedId) : undefined;

	// Mark as read
	const { fetchArticleContent } = useFeeds();

useEffect(() => {
  if (article && !article.read) void markArticleRead(id, true);
  void fetchArticleContent(id);
}, [id]);
	if (!article) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="font-semibold text-2xl">Article not found</h1>
					<p className="mt-2 text-muted-foreground">
						The article you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	const rawContent = article.content || article.contentSnippet || "";
	const preparedHtml = useMemo(() => prepareContent(rawContent), [rawContent]);
console.log("fullContent:", article.fullContent?.slice(0, 100));
console.log("content:", article.content?.slice(0, 100));
	const wordCount = rawContent
		.replace(/<[^>]*>/g, " ")
		.split(/\s+/)
		.filter(Boolean).length;
	const readTime = Math.max(1, Math.ceil(wordCount / 220));

	const date = article.pubDate
		? new Date(article.pubDate).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "";

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Sticky header */}
			<header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => window.history.back()}
						className="text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-5" />
					</Button>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => void toggleArticleLike(id)}
							className={cn(
								"text-muted-foreground hover:text-foreground",
								article.liked && "text-red-500 hover:text-red-500",
							)}
						>
							<Heart
								className={cn("size-5", article.liked && "fill-current")}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => void toggleArticleSave(id)}
							className={cn(
								"text-muted-foreground hover:text-foreground",
								article.saved && "text-primary hover:text-primary",
							)}
						>
							<Bookmark
								className={cn("size-5", article.saved && "fill-current")}
							/>
						</Button>
						{article.link && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => window.open(article.link, "_blank", "noopener")}
								className="text-muted-foreground hover:text-foreground"
							>
								<ExternalLink className="size-5" />
							</Button>
						)}
					</div>
				</div>
			</header>

			{/* Article */}
			<main className="flex-1">
				<div className="mx-auto max-w-3xl px-5 py-10">
					{/* Feed label */}
					{feed?.title && (
						<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
							{feed.title}
						</p>
					)}

					{/* Title */}
					<h1 className="mb-5 font-bold text-4xl text-foreground leading-tight">
						{article.title}
					</h1>

					{/* Meta */}
					<div className="mb-8 flex items-center gap-3 border-border border-b pb-5 text-muted-foreground text-sm">
						<div className="flex items-center gap-1.5">
							<Clock className="size-3.5" />
							<span>{readTime} min read</span>
						</div>
						{date && (
							<>
								<span className="text-border">·</span>
								<span>{date}</span>
							</>
						)}
						{article.link && (
							<>
								<span className="text-border">·</span>
								<a
									href={article.link}
									target="_blank"
									rel="noopener noreferrer"
									className="truncate max-w-[200px] hover:text-foreground transition-colors hover:underline"
								>
									{new URL(article.link).hostname}
								</a>
							</>
						)}
					</div>

					{/* Hero image */}
					{article.imageUrl && (
						<div className="mb-8 overflow-hidden rounded-xl">
							<img
								src={article.imageUrl}
								alt={article.title}
								className="h-auto w-full object-cover max-h-96"
							/>
						</div>
					)}

					{/* Article body — rendered HTML */}
					<div
						className={cn(
							// Base prose styles
							"text-foreground",
							// Paragraphs
							"[&_p]:mb-5 [&_p]:text-[17px] [&_p]:leading-8 [&_p]:text-foreground",
							// Headings
							"[&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:text-foreground",
							"[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-foreground",
							"[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:text-foreground",
							"[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:text-lg [&_h4]:text-foreground",
							// Links
							"[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80",
							// Lists
							"[&_ul]:mb-5 [&_ul]:ml-6 [&_ul]:list-disc [&_ul_li]:mb-1.5 [&_ul_li]:text-[17px] [&_ul_li]:leading-7",
							"[&_ol]:mb-5 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol_li]:mb-1.5 [&_ol_li]:text-[17px] [&_ol_li]:leading-7",
							// Blockquote
							"[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
							// Code
							"[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground",
							"[&_pre]:mb-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4",
							"[&_pre_code]:bg-transparent [&_pre_code]:p-0",
							// Images
							"[&_img]:my-6 [&_img]:rounded-xl [&_img]:max-w-full [&_img]:h-auto",
							"[&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground",
							// HR
							"[&_hr]:my-8 [&_hr]:border-border",
							// Strong / em
							"[&_strong]:font-semibold [&_strong]:text-foreground",
							"[&_em]:italic",
							// Table
							"[&_table]:mb-5 [&_table]:w-full [&_table]:border-collapse",
							"[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold",
							"[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm",
						)}
						// react-html-parser sanitises by default — but we also cleaned
						// the HTML above, removing scripts/iframes/forms.
					>
						{HtmlParser(preparedHtml, {
							transform: (node: any, index: number) => {
								// Open all links in a new tab
								if (node.type === "tag" && node.name === "a") {
									const href = node.attribs?.href;
									if (href) {
										node.attribs.target = "_blank";
										node.attribs.rel = "noopener noreferrer";
									}
								}
								// Remove any inline scripts that slipped through
								if (node.type === "tag" && node.name === "script") {
									return null;
								}
								return undefined; // Let the default renderer handle it
							},
						})}
					</div>

					{/* Footer CTA */}
					{article.link && (
						<div className="mt-10 border-border border-t pt-8">
							<a
								href={article.link}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
							>
								<ExternalLink className="size-4" />
								Read on {feed?.title ?? new URL(article.link).hostname}
							</a>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}