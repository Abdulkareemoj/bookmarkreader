import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Bookmark as BookmarkIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BookmarkGridView } from "@/components/bookmarks/bookmark-grid-view";
import { BookmarkListView } from "@/components/bookmarks/bookmark-list-view";
import { useBookmarks } from "@/hooks/use-bookmarks";

export const Route = createFileRoute("/bookmarks/")({
  component: BookmarksComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    filter: (search.filter as string) || "all",
  }),
});

type ViewMode = "list" | "grid";

function BookmarksComponent() {
  const { filter } = Route.useSearch();
  const { bookmarks, removeBookmark, toggleLike, toggleSave } =
    useBookmarks(filter);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const currentCollectionName = useMemo(() => {
    if (!filter || filter === "all") return "All Bookmarks";
    // Find the collection name from the first matching bookmark
    const collection = bookmarks.find(
      (b) => b.collectionId === filter
    )?.collection;
    return collection || "Collection";
  }, [bookmarks, filter]);

  // --- Action Handlers ---
  const handleLike = (id: string) => {
    toggleLike(id);
  };

  const handleSave = (id: string) => {
    toggleSave(id);
  };

  const handleDelete = (id: string) => {
    removeBookmark(id);
  };
  // -----------------------

  const renderContent = () => {
    if (bookmarks.length === 0) {
      return (
        <div className="flex p-4 justify-center">
          <Empty className="rounded-lg border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookmarkIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No Bookmarks Found</EmptyTitle>
              <EmptyDescription>
                {filter && filter !== "all"
                  ? `There are no bookmarks in the collection "${currentCollectionName}".`
                  : "You haven't saved any bookmarks yet. Start by adding one!"}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {/* Placeholder for Add Bookmark button/action */}
              <Button>Add Bookmark</Button>
            </EmptyContent>
          </Empty>
        </div>
      );
    }

    const commonProps = {
      bookmarks: bookmarks,
      onLike: handleLike,
      onSave: handleSave,
      onDelete: handleDelete,
    };

    if (viewMode === "list") {
      return <BookmarkListView {...commonProps} />;
    }

    return <BookmarkGridView {...commonProps} />;
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold">{currentCollectionName}</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <List className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
