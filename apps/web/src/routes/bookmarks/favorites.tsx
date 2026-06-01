import { createFileRoute } from "@tanstack/react-router";
import { Heart, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { BookmarkGridView } from "@/components/bookmarks/bookmark-grid-view";
import { BookmarkListView } from "@/components/bookmarks/bookmark-list-view";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/bookmarks/favorites")({
	component: FavoritesPage,
});

type ViewMode = "list" | "grid";

function FavoritesPage() {
	const { bookmarks, toggleLike, toggleSave, removeBookmark } =
		useBookmarks("favorites");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const { bookmarkAgent } = useReaderStore((s) => s);

	const stats = useMemo(
		() => ({
			total: bookmarks.length,
		}),
		[bookmarks],
	);

	return (
		<div className="flex h-full flex-col">
			<header className="flex items-center justify-between border-b px-6 py-3">
				<div className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
						<Heart className="size-4" />
					</div>
					<div>
						<h1 className="text-sm font-semibold">Favorites</h1>
						<p className="text-xs text-muted-foreground">
							{stats.total} bookmark{stats.total !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="icon"
						onClick={() => setViewMode("list")}
					>
						<List data-icon="inline-start" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="icon"
						onClick={() => setViewMode("grid")}
					>
						<LayoutGrid data-icon="inline-start" />
					</Button>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto">
				{bookmarks.length > 0 ? (
					viewMode === "list" ? (
						<BookmarkListView
							bookmarks={bookmarks}
							onLike={toggleLike}
							onSave={toggleSave}
							onDelete={removeBookmark}
							onEdit={() => {}}
							onMove={(id, collectionId) =>
								void bookmarkAgent.updateBookmark(id, { collectionId })
							}
						/>
					) : (
						<BookmarkGridView
							bookmarks={bookmarks}
							onLike={toggleLike}
							onSave={toggleSave}
							onDelete={removeBookmark}
							onEdit={() => {}}
							onMove={(id, collectionId) =>
								void bookmarkAgent.updateBookmark(id, { collectionId })
							}
						/>
					)
				) : (
					<div className="flex justify-center p-4">
						<Empty className="rounded-lg border">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Heart className="size-6" />
								</EmptyMedia>
								<EmptyTitle>No favorites yet</EmptyTitle>
								<EmptyDescription>
									Mark bookmarks as favorites by toggling the heart icon to see
									them here.
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<p className="text-sm text-muted-foreground">
									Bookmarks marked as favorites will appear on this page.
								</p>
							</EmptyContent>
						</Empty>
					</div>
				)}
			</div>
		</div>
	);
}
