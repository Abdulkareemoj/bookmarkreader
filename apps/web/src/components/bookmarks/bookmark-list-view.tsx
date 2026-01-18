import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { Bookmark } from "@packages/store";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  Heart,
  Bookmark as BookmarkIcon,
  Trash2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}

function BookmarkListItem({
  bookmark,
  onLike,
  onSave,
  onDelete,
}: {
  bookmark: Bookmark;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const handleCopyUrl = () => {
    if (bookmark.url) {
      void navigator.clipboard.writeText(bookmark.url);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          key={bookmark.id}
          to="/bookmarks/$id"
          params={{ id: bookmark.id }}
          className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium">{bookmark.title}</span>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <LinkIcon className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">
                {bookmark.url ? new URL(bookmark.url).hostname : "No URL"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike(bookmark.id);
              }}
              title={bookmark.liked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  bookmark.liked && "fill-current text-red-500"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(bookmark.id);
              }}
              title={bookmark.saved ? "Remove from saved" : "Save"}
            >
              <BookmarkIcon
                className={cn("h-4 w-4", bookmark.saved && "fill-current")}
              />
            </Button>
            <ConfirmationDialog
              title="Confirm Deletion"
              description={`Are you sure you want to delete the bookmark: "${bookmark.title}"? This action cannot be undone.`}
              onConfirm={() => onDelete(bookmark.id)}
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
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(bookmark.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function BookmarkListView({
  bookmarks,
  onLike,
  onSave,
  onDelete,
  onEdit,
  onMove,
}: BookmarkListViewProps) {
  const search = useRouterState({
    select: (s) => (s.location.search as any)?.q ?? "",
  });

  const filteredBookmarks = useMemo(() => {
    const q = typeof search === "string" ? search.trim().toLowerCase() : "";
    if (!q) return bookmarks;
    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(q) ||
        bookmark.url?.toLowerCase().includes(q) ||
        bookmark.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [bookmarks, search]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {filteredBookmarks.length > 0 ? (
          <div className="space-y-2">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                bookmark={bookmark}
                onLike={onLike}
                onSave={onSave}
                onDelete={onDelete}
                onEdit={onEdit}
                onMove={onMove}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No bookmarks found</p>
              <p className="text-muted-foreground">
                {search
                  ? `No bookmarks found matching "${search}".`
                  : "You haven't saved any bookmarks yet."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
