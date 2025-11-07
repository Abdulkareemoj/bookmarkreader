import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useFeeds } from "@/hooks/use-feeds";
import type { Article } from "@packages/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Bookmark, Check } from "lucide-react";
import { z } from "zod";

// Define the search parameter schema
const rssSearchSchema = z.object({
  filter: z.string().nullable().catch(null), // 'feedId' or null for all
});

export const Route = createFileRoute("/rss/")({
  component: RssComponent,
  validateSearch: rssSearchSchema,
});

// --- Component 1: ArticleList ---
interface ArticleListProps {
  articles: Article[];
  feeds: { id: string; title: string }[];
  toggleArticleRead: (id: string) => void;
  toggleArticleLike: (id: string) => void;
  toggleArticleSave: (id: string) => void;
}

function ArticleList({
  articles,
  feeds,
  toggleArticleRead,
  toggleArticleLike,
  toggleArticleSave,
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No articles found for this feed.
      </div>
    );
  }

  // Sort articles by date (newest first)
  const sortedArticles = articles.sort(
    (a, b) =>
      new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {sortedArticles.map((article) => (
          <div
            key={article.id}
            className={cn(
              "cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50",
              article.read ? "opacity-60" : "bg-card shadow-sm"
            )}
            onClick={() => window.open(article.link, "_blank")}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArticleLike(article.id);
                  }}
                  title={article.liked ? "Unlike" : "Like"}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      article.liked && "fill-current text-red-500"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArticleSave(article.id);
                  }}
                  title={article.saved ? "Remove from saved" : "Save"}
                >
                  <Bookmark
                    className={cn("h-4 w-4", article.saved && "fill-current")}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArticleRead(article.id);
                  }}
                  title={article.read ? "Mark as Unread" : "Mark as Read"}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      article.read ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {article.contentSnippet || "No snippet available."}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">
                {feeds.find((f) => f.id === article.feedId)?.title ||
                  "Unknown Feed"}
              </span>
              <span>
                {article.pubDate
                  ? new Date(article.pubDate).toLocaleDateString()
                  : "Unknown Date"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// --- Main Route Component ---
function RssComponent() {
  // Read the filter from the URL search parameters
  const { filter } = Route.useSearch();

  const {
    feeds,
    articles: allArticles,
    toggleArticleRead,
    toggleArticleLike,
    toggleArticleSave,
  } = useFeeds();

  // Filter articles based on the URL filter (feedId or null for all)
  const articles = filter
    ? allArticles.filter((a) => a.feedId === filter)
    : allArticles;

  // Determine the title for the main content area
  const mainTitle = filter
    ? feeds.find((f) => f.id === filter)?.title || "Articles"
    : "All Articles";

  return (
    // The root layout handles the flex container and sidebar, so this component
    // only needs to define its content structure.
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <h1 className="font-bold text-2xl">{mainTitle}</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <ArticleList
          articles={articles}
          feeds={feeds}
          toggleArticleRead={toggleArticleRead}
          toggleArticleLike={toggleArticleLike}
          toggleArticleSave={toggleArticleSave}
        />
      </div>
    </div>
  );
}
