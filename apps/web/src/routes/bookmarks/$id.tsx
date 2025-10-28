import { createFileRoute } from "@tanstack/react-router";
import BookmarkDisplay from "@/components/bookmark-display";
import { bookmarks } from "@/lib/mock-data";

export const Route = createFileRoute("/bookmarks/$id")({
  component: BookmarkPageComponent,
});

function BookmarkPageComponent() {
  const { id } = Route.useParams();
  const bookmark = bookmarks.find((b) => b.id === id);

  if (!bookmark) {
    return (
      <div className="p-4">
        <h1 className="text-2xl">Bookmark not found</h1>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <BookmarkDisplay {...bookmark} />
    </main>
  );
}
