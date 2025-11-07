import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookmarkGridCard } from "./bookmark-grid-card";
import type { Bookmark } from "@packages/store"; // Import Bookmark type from shared store

interface BookmarkGridViewProps {
  bookmarks: Bookmark[];
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BookmarkGridView({
  bookmarks,
  onLike,
  onSave,
  onDelete,
}: BookmarkGridViewProps) {
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                to="/bookmarks/$id"
                params={{ id: bookmark.id }}
                className="block"
              >
                <BookmarkGridCard
                  id={bookmark.id}
                  title={bookmark.title}
                  url={bookmark.url || ""}
                  liked={bookmark.liked}
                  saved={bookmark.saved}
                  onLike={onLike}
                  onSave={onSave}
                  onDelete={onDelete}
                  onClick={() => {
                    // The Link component handles navigation, but we need an empty handler for the card prop
                  }}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-muted-foreground">No bookmarks found</p>
              <p className="text-muted-foreground text-sm">
                {search
                  ? "Try adjusting your search query"
                  : "No bookmarks available"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
