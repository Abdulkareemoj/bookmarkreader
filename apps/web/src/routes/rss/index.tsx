import { createFileRoute } from "@tanstack/react-router";
import { useFeeds } from "@/hooks/use-feeds";
import type { Article } from "@packages/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Heart,
  Bookmark,
  Check,
  Rss,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { z } from "zod";
import { AddFeedDialog } from "@/components/rss/add-feed-dialog";
import { Empty } from "@/components/ui/empty";
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import ArticleCard from "@/components/rss/article-card";

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
        <Empty className="rounded-xl border max-w-sm w-full">
          <div className="text-center space-y-3 p-8">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
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
              <p className="text-sm text-muted-foreground mt-1">
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
      new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
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
                  "flex items-start gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-muted/50",
                  article.read && "opacity-60"
                )}
              >
                {/* Thumbnail small */}
                <div className="h-14 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                  {extractImageFromContent(article.content || article.contentSnippet) ? (
                    <img
                      src={extractImageFromContent(article.content || article.contentSnippet)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground/30">
                        {article.title?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.preventDefault(); toggleArticleLike(article.id); }}
                      >
                        <Heart className={cn("h-3.5 w-3.5", article.liked && "fill-current text-red-500")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.preventDefault(); toggleArticleSave(article.id); }}
                      >
                        <Bookmark className={cn("h-3.5 w-3.5", article.saved && "fill-current text-primary")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.preventDefault(); toggleArticleRead(article.id); }}
                      >
                        <Check className={cn("h-3.5 w-3.5", article.read && "text-primary")} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {feedTitle && <span className="font-medium truncate">{feedTitle}</span>}
                    {feedTitle && <span className="text-border">·</span>}
                    <span>
                      {article.pubDate
                        ? new Date(article.pubDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
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
        const imageUrl = extractImageFromContent(article.content || article.contentSnippet);

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
              excerpt={article.contentSnippet?.replace(/<[^>]*>/g, "").slice(0, 120) ?? ""}
              category={feedTitle ?? "RSS"}
              readTime={Math.max(1, Math.ceil((article.content?.replace(/<[^>]*>/g, "").length ?? 0) / 1000))}
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
              feedTitle={feedTitle}
              liked={article.liked}
              saved={article.saved}
              read={article.read}
              onLike={(e) => { toggleArticleLike(article.id); }}
              onSave={(e) => { toggleArticleSave(article.id); }}
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
        a.contentSnippet?.toLowerCase().includes(q)
    );
  }, [filteredByFeed, search]);

  const mainTitle = filter
    ? feeds.find((f) => f.id === filter)?.title ?? "Articles"
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
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-semibold text-xl text-foreground truncate">
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-sm bg-muted/50 border-transparent focus:border-border focus:bg-background"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border p-0.5 gap-0.5">
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
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-6 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/50"
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