import { Button } from "@/components/ui/button";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  author: string;
  date: string;
  liked?: boolean;
  saved?: boolean;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onClick?: () => void;
}

export default function ArticleCard({
  id,
  title,
  excerpt,
  category,
  readTime,
  author,
  date,
  liked = false,
  saved = false,
  onLike,
  onSave,
  onShare,
  onClick,
}: ArticleCardProps) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
    >
      <div className="space-y-3">
        {/* Header with category and read time */}
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
            {category}
          </span>
          <span className="text-muted-foreground text-xs">
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="line-clamp-2 text-muted-foreground text-sm">{excerpt}</p>

        {/* Footer with author, date, and actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20" />
            <div className="text-xs">
              <p className="font-medium text-foreground">{author}</p>
              <p className="text-muted-foreground">{date}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Heart
                className={cn("h-4 w-4", liked && "fill-current text-red-500")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
