import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import SearchBar from "@/components/search-bar";
import BookmarkCard from "./bookmark-card";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  notes?: string;
  tags?: string[];
}

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
}

export default function BookmarkListView({ bookmarks }: BookmarkListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [bookmarks, searchQuery]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="sticky top-0 border-border border-b bg-background/95 p-4 backdrop-blur">
        <SearchBar onSearch={setSearchQuery} />
      </div>

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
                <BookmarkCard title={bookmark.title} url={bookmark.url} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-muted-foreground">No bookmarks found</p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
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
