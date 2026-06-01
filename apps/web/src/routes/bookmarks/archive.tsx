import { createFileRoute } from "@tanstack/react-router";
import { Archive, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
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

export const Route = createFileRoute("/bookmarks/archive")({
	component: ArchivePage,
});

type ViewMode = "list" | "grid";

function ArchivePage() {
	const { bookmarks, toggleLike, toggleSave, removeBookmark } =
		useBookmarks("all");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const { bookmarkAgent } = useReaderStore((s) => s);

	return (
		<div className="flex h-full flex-col">
			<header className="flex items-center justify-between border-b px-6 py-3">
				<div className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
						<Archive className="size-4" />
					</div>
					<div>
						<h1 className="text-sm font-semibold">Archive</h1>
						<p className="text-xs text-muted-foreground">
							{bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
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
									<Archive className="size-6" />
								</EmptyMedia>
								<EmptyTitle>Archive is empty</EmptyTitle>
								<EmptyDescription>
									Archived bookmarks will appear here. Archive bookmarks you
									want to keep but don&apos;t need right now.
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<p className="text-sm text-muted-foreground">
									Coming soon — archive functionality will allow you to move
									bookmarks to a separate view.
								</p>
							</EmptyContent>
						</Empty>
					</div>
				)}
			</div>
		</div>
	);
}
