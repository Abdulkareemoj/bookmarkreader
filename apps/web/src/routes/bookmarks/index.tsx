import { createFileRoute } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import BookmarkListView from "@/components/bookmark-list-view";
import { bookmarks } from "@/lib/mock-data";

export const Route = createFileRoute("/bookmarks/")({
  component: BookmarksComponent,
});

function BookmarksComponent() {
  const search = useRouterState({ select: (s) => (s.location.search as any)?.collection ?? "all" });
  const filtered = Array.isArray(bookmarks)
    ? bookmarks.filter((b) => {
        if (!search || search === "all") return true;
        const q = String(search).toLowerCase();
        return b.tags?.some((t) => t.toLowerCase() === q);
      })
    : bookmarks;

  return (
    <main className="flex-1 overflow-hidden">
      <BookmarkListView bookmarks={filtered} />
    </main>
  );
}
