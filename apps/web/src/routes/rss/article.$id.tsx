import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, Share2, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  author: string;
  date: string;
  imageUrl?: string;
  feedTitle?: string;
  liked?: boolean;
  saved?: boolean;
  read?: boolean;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onClick?: () => void;
}

export const Route = createFileRoute("/rss/article/$id")({
  component: ArticleCardComponent,
});

function ArticleCardComponent({
  id,
  title,
  excerpt,
  category,
  readTime,
  author,
  date,
  imageUrl,
  feedTitle,
  liked = false,
  saved = false,
  read = false,
  onLike,
  onSave,
  onShare,
  onClick,
}: ArticleCardProps) {
  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative flex flex-col cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all duration-200",
        "hover:border-border/80 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
        read && "opacity-60"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-4xl font-bold text-muted-foreground/20 select-none">
              {title.charAt(0)}
            </div>
          </div>
        )}

        {/* Category badge overlaid on image */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-foreground border border-border/50">
            {category}
          </span>
        </div>

        {/* Read indicator */}
        {read && (
          <div className="absolute inset-0 bg-background/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Feed source */}
        {feedTitle && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
            {feedTitle}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="shrink-0">{readTime}m</span>
            <span className="text-border">·</span>
            <span className="truncate">{date}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 -mr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onLike?.(); }}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-current text-red-500")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onSave?.(); }}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onShare?.(); }}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}