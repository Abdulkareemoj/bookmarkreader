import { createFileRoute } from "@tanstack/react-router";
import BookmarkListView from "@/components/bookmark-list-view";
import { bookmarks } from "@/lib/mock-data";

export const Route = createFileRoute("/bookmarks/")({
  component: BookmarksComponent,
});

function BookmarksComponent() {
  return (
    <main className="flex-1 overflow-hidden">
      <BookmarkListView bookmarks={bookmarks} />
    </main>
  );
}
