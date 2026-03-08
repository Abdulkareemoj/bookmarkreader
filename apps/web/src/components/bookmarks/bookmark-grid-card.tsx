import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Heart, Bookmark, Trash2, Copy, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface BookmarkGridCardProps {
  id: string;
  title: string;
  url?: string;
  favicon?: string;
  liked: boolean;
  saved: boolean;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onEdit: (id: string) => void;
  onMove: (id: string, collectionId: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function BookmarkGridCard({
  id,
  title,
  url,
  favicon,
  liked,
  saved,
  onLike,
  onSave,
  onDelete,
  onEdit,
  onMove,
  onClick,
}: BookmarkGridCardProps) {
  const handleCopyUrl = () => {
    if (url) {
      void navigator.clipboard.writeText(url);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <article
          onClick={onClick}
          className="group relative cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
        >
          <CardHeader className="p-0">
            <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {favicon ? (
                <img 
                  src={favicon} 
                  alt="Favicon" 
                  className="h-4 w-4 shrink-0"
                  onError={(e) => {
                    // Hide favicon if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <LinkIcon className="h-4 w-4 shrink-0" />
              )}
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMove(id, "inbox")}>
          <Bookmark className="mr-2 h-4 w-4" />
          Move to Inbox
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
