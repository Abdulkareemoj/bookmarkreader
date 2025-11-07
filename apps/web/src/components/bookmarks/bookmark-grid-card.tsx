import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Heart, Bookmark, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";

interface BookmarkGridCardProps {
  id: string;
  title: string;
  url?: string; // Changed to optional
  liked: boolean;
  saved: boolean;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function BookmarkGridCard({
  id,
  title,
  url,
  liked,
  saved,
  onLike,
  onSave,
  onDelete,
  onClick,
}: BookmarkGridCardProps) {
  return (
    <article
      onClick={onClick}
      className="group relative cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
    >
      <CardHeader className="p-0">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <LinkIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{url ?? "No URL available"}</span>
        </div>
      </CardContent>

      {/* Actions Overlay */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLike(id);
          }}
          title={liked ? "Unlike" : "Like"}
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
            e.preventDefault();
            e.stopPropagation();
            onSave(id);
          }}
          title={saved ? "Remove from saved" : "Save"}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
        <ConfirmationDialog
          title="Confirm Deletion"
          description={`Are you sure you want to delete the bookmark: "${title}"? This action cannot be undone.`}
          onConfirm={() => onDelete(id)}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </article>
  );
}
