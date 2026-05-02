import type { Article } from "@packages/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Bookmark,
	Check,
	Heart,
	LayoutGrid,
	List,
	RefreshCw,
	Rss,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AddFeedDialog } from "@/components/rss/add-feed-dialog";
import ArticleCard from "@/components/rss/article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFeeds } from "@/hooks/use-feeds";
import { cn } from "@/lib/utils";

const rssSearchSchema = z.object({
	filter: z.string().nullable().catch(null),
});

export const Route = createFileRoute("/rss/")({
	component: RssComponent,
	validateSearch: rssSearchSchema,
});

// Attempt to extract an image URL from content/snippet HTML
function extractImageFromContent(content?: string): string | undefined {
	if (!content) return undefined;
	const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
	return match?.[1];
}

function ArticleGrid({
	articles,
	feeds,
	toggleArticleRead,
	toggleArticleLike,
	toggleArticleSave,
	viewMode,
}: {
	articles: Article[];
	feeds: { id: string; title: string }[];
	toggleArticleRead: (id: string) => void;
	toggleArticleLike: (id: string) => void;
	toggleArticleSave: (id: string) => void;
	viewMode: "grid" | "list";
}) {
	if (articles.length === 0) {
		const hasNoFeeds = feeds.length === 0;
		return (
			<div className="flex justify-center p-8">
				<Empty className="w-full max-w-sm rounded-xl border">
					<div className="space-y-3 p-8 text-center">
						<div className="flex justify-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								{hasNoFeeds ? (
									<Rss className="h-5 w-5 text-muted-foreground" />
								) : (
									<Check className="h-5 w-5 text-muted-foreground" />
								)}
							</div>
						</div>
						<div>
							<h2 className="font-semibold text-foreground">
								{hasNoFeeds ? "No feeds yet" : "All caught up"}
							</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								{hasNoFeeds
									? "Add an RSS feed to start reading"
									: "No articles found for this feed"}
							</p>
						</div>
						{hasNoFeeds && (
							<div className="pt-2">
								<AddFeedDialog />
							</div>
						)}
					</div>
				</Empty>
			</div>
		);
	}

	const sorted = [...articles].sort(
		(a, b) =>
			new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
	);

	if (viewMode === "list") {
		return (
			<div className="space-y-px">
				{sorted.map((article) => {
					const feedTitle = feeds.find((f) => f.id === article.feedId)?.title;
					return (
						<Link
							key={article.id}
							to="/rss/article/$id"
							params={{ id: article.id }}
							className="block"
						>
							<div
								className={cn(
									"flex items-start gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50",
									article.read && "opacity-60",
								)}
							>
								{/* Thumbnail small */}
								<div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
									{article.imageUrl ? (
										<img
											src={article.imageUrl}
											alt=""
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<span className="font-bold text-lg text-muted-foreground/30">
												{article.title?.charAt(0)}
											</span>
										</div>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<h3 className="line-clamp-2 font-medium text-foreground text-sm leading-snug">
											{article.title}
										</h3>
										<div className="flex shrink-0 items-center gap-0.5">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleLike(article.id);
												}}
											>
												<Heart
													className={cn(
														"h-3.5 w-3.5",
														article.liked && "fill-current text-red-500",
													)}
												/>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleSave(article.id);
												}}
											>
												<Bookmark
													className={cn(
														"h-3.5 w-3.5",
														article.saved && "fill-current text-primary",
													)}
												/>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-foreground"
												onClick={(e) => {
													e.preventDefault();
													toggleArticleRead(article.id);
												}}
											>
												<Check
													className={cn(
														"h-3.5 w-3.5",
														article.read && "text-primary",
													)}
												/>
											</Button>
										</div>
									</div>
									<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
										{feedTitle && (
											<span className="truncate font-medium">{feedTitle}</span>
										)}
										{feedTitle && <span className="text-border">·</span>}
										<span>
											{article.pubDate
												? new Date(article.pubDate).toLocaleDateString(
														undefined,
														{
															month: "short",
															day: "numeric",
														},
													)
												: "Unknown date"}
										</span>
									</div>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{sorted.map((article) => {
				const feedTitle = feeds.find((f) => f.id === article.feedId)?.title;
				const imageUrl =
					article.imageUrl ||
					extractImageFromContent(article.content || article.contentSnippet);

				return (
					<Link
						key={article.id}
						to="/rss/article/$id"
						params={{ id: article.id }}
						className="block"
					>
						<ArticleCard
							id={article.id}
							title={article.title ?? "Untitled"}
							excerpt={
								article.contentSnippet?.replace(/<[^>]*>/g, "").slice(0, 120) ??
								""
							}
							category={feedTitle ?? "RSS"}
							readTime={Math.max(
								1,
								Math.ceil(
									(article.content?.replace(/<[^>]*>/g, "").length ?? 0) / 1000,
								),
							)}
							author=""
							date={
								article.pubDate
									? new Date(article.pubDate).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})
									: ""
							}
							imageUrl={imageUrl}
							imageData={article.imageData}
							feedTitle={feedTitle}
							liked={article.liked}
							saved={article.saved}
							read={article.read}
							onLike={(e) => {
								toggleArticleLike(article.id);
							}}
							onSave={(e) => {
								toggleArticleSave(article.id);
							}}
						/>
					</Link>
				);
			})}
		</div>
	);
}

function RssComponent() {
	const { filter } = Route.useSearch();
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		feeds,
		articles: allArticles,
		toggleArticleRead,
		toggleArticleLike,
		toggleArticleSave,
		refreshFeed,
	} = useFeeds();

	const filteredByFeed = filter
		? allArticles.filter((a) => a.feedId === filter)
		: allArticles;

	const articles = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return filteredByFeed;
		return filteredByFeed.filter(
			(a) =>
				a.title?.toLowerCase().includes(q) ||
				a.contentSnippet?.toLowerCase().includes(q),
		);
	}, [filteredByFeed, search]);

	const mainTitle = filter
		? (feeds.find((f) => f.id === filter)?.title ?? "Articles")
		: "All Articles";

	const unreadCount = articles.filter((a) => !a.read).length;

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			if (filter) {
				await refreshFeed(filter);
			} else {
				await Promise.all(feeds.map((f) => refreshFeed(f.id)));
			}
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between gap-4 px-6 py-4">
					<div className="flex min-w-0 items-center gap-3">
						<h1 className="truncate font-semibold text-foreground text-xl">
							{mainTitle}
						</h1>
						{unreadCount > 0 && (
							<Badge variant="secondary" className="shrink-0 text-xs">
								{unreadCount} unread
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-2">
						{/* Search */}
						<div className="relative hidden sm:block">
							<Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search articles..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-8 w-48 border-transparent bg-muted/50 pl-8 text-sm focus:border-border focus:bg-background"
							/>
						</div>

						{/* View toggle */}
						<div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
							<Button
								variant={viewMode === "grid" ? "secondary" : "ghost"}
								size="icon"
								className="h-7 w-7"
								onClick={() => setViewMode("grid")}
							>
								<LayoutGrid className="h-3.5 w-3.5" />
							</Button>
							<Button
								variant={viewMode === "list" ? "secondary" : "ghost"}
								size="icon"
								className="h-7 w-7"
								onClick={() => setViewMode("list")}
							>
								<List className="h-3.5 w-3.5" />
							</Button>
						</div>

						{/* Refresh */}
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={isRefreshing}
							className="h-8 gap-1.5"
						>
							<RefreshCw
								className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
							/>
							<span className="hidden sm:inline">Refresh</span>
						</Button>
					</div>
				</div>

				{/* Mobile search */}
				<div className="px-6 pb-3 sm:hidden">
					<div className="relative">
						<Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search articles..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-8 bg-muted/50 pl-8 text-sm"
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			<ScrollArea className="flex-1">
				<div className="p-6">
					<ArticleGrid
						articles={articles}
						feeds={feeds}
						toggleArticleRead={toggleArticleRead}
						toggleArticleLike={toggleArticleLike}
						toggleArticleSave={toggleArticleSave}
						viewMode={viewMode}
					/>
				</div>
			</ScrollArea>
		</div>
	);
}
