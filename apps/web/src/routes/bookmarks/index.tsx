import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Bookmark as BookmarkIcon,
	Heart,
	LayoutGrid,
	List,
	Tag,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AddBookmarkDialog } from "@/components/bookmarks/add-bookmark-dialog";
import { BookmarkGridView } from "@/components/bookmarks/bookmark-grid-view";
import { BookmarkListView } from "@/components/bookmarks/bookmark-list-view";
import { EditBookmarkDialog } from "@/components/bookmarks/edit-bookmark-dialog";
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
import { useCollectionsStore } from "@/lib/collections-store";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/bookmarks/")({
	component: BookmarksComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		filter: (search.filter as string) || "all",
		tags: (search.tags as string) || "",
	}),
});

type ViewMode = "list" | "grid";

function BookmarksComponent() {
	const { filter, tags: tagsParam } = Route.useSearch();
	const navigate = useNavigate();
	const bookmarksData = useBookmarks(filter);
	const { bookmarks, removeBookmark, toggleLike, toggleSave, addBookmark } =
		bookmarksData;
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [editingBookmark, setEditingBookmark] = useState<string | null>(null);

	const { bookmarkAgent } = useReaderStore((state) => state);
	const { bookmarkCollections } = useCollectionsStore();

	const handleEdit = (id: string) => {
		setEditingBookmark(id);
	};

	const handleMove = (id: string, collectionId: string) => {
		void bookmarkAgent.updateBookmark(id, { collectionId });
	};

	const handleCloseEdit = () => {
		setEditingBookmark(null);
	};

	const currentCollectionName = useMemo(() => {
		if (!filter || filter === "all") return "All Bookmarks";
		const collection = bookmarkCollections.find((c: any) => c.id === filter);
		return collection?.name || "Collection";
	}, [bookmarks, filter, bookmarkCollections]);

	// Tag filtering from URL param
	const selectedTags = useMemo(() => {
		if (!tagsParam) return [];
		return tagsParam.split(",").filter(Boolean);
	}, [tagsParam]);

	// Extract all unique tags from bookmarks
	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		bookmarks.forEach((b) => {
			if (b.tags && Array.isArray(b.tags)) {
				b.tags.forEach((t) => tagSet.add(t));
			}
		});
		return Array.from(tagSet).sort();
	}, [bookmarks]);

	// Derive tag counts
	const tagCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		bookmarks.forEach((b) => {
			if (b.tags && Array.isArray(b.tags)) {
				b.tags.forEach((t) => {
					counts[t] = (counts[t] || 0) + 1;
				});
			}
		});
		return counts;
	}, [bookmarks]);

	// Apply tag filter client-side on top of collection filter
	const filteredBookmarks = useMemo(() => {
		if (selectedTags.length === 0) return bookmarks;
		return bookmarks.filter((b) =>
			selectedTags.some((t) => b.tags?.includes(t)),
		);
	}, [bookmarks, selectedTags]);

	const hasActiveFilters = selectedTags.length > 0;

	const isFavoritesView = filter === "favorites";

	// Stats
	const stats = useMemo(() => {
		return {
			total: filteredBookmarks.length,
			favorites: filteredBookmarks.filter((b) => b.liked).length,
			tagsCount: allTags.length,
		};
	}, [filteredBookmarks, allTags]);

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

	const toggleTagParam = (tag: string) => {
		const current = new Set(selectedTags);
		if (current.has(tag)) {
			current.delete(tag);
		} else {
			current.add(tag);
		}
		const next = Array.from(current);
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: next.length > 0 ? next.join(",") : undefined,
			}),
			replace: true,
		});
	};

	const clearTagFilters = () => {
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: undefined,
			}),
			replace: true,
		});
	};
	// -----------------------

	const renderContent = () => {
		if (filteredBookmarks.length === 0) {
			return (
				<div className="flex justify-center p-4">
					<Empty className="rounded-lg border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<BookmarkIcon data-icon="inline-start" className="size-6" />
							</EmptyMedia>
							<EmptyTitle>No Bookmarks Found</EmptyTitle>
							<EmptyDescription>
								{hasActiveFilters
									? "Try adjusting your filters to find what you're looking for."
									: filter && filter !== "all"
										? `There are no bookmarks in the collection "${currentCollectionName}".`
										: "You haven't saved any bookmarks yet. Start by adding one!"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							{hasActiveFilters ? (
								<Button variant="outline" size="sm" onClick={clearTagFilters}>
									Clear filters
								</Button>
							) : (
								<p>
									Use the Add button in the header to create your first
									bookmark.
								</p>
							)}
						</EmptyContent>
					</Empty>
				</div>
			);
		}

		const commonProps = {
			bookmarks: filteredBookmarks,
			onLike: handleLike,
			onSave: handleSave,
			onDelete: handleDelete,
			onEdit: handleEdit,
			onMove: handleMove,
		};

		if (viewMode === "list") {
			return <BookmarkListView {...commonProps} />;
		}

		return <BookmarkGridView {...commonProps} />;
	};

	return (
		<div className="flex h-full flex-col">
			<header className="flex items-center justify-between border-b px-6 py-3">
				<div className="flex items-center gap-4">
					<AddBookmarkDialog
						onAddBookmark={(data) => {
							void addBookmark({
								url: data.url,
								title: data.title,
								tags: data.tags,
								collectionId: data.collectionId || filter || "inbox",
								image: data.image,
							});
						}}
					/>
				</div>
				<div className="flex items-center gap-2">
					{/* Stats */}
					{filteredBookmarks.length > 0 && (
						<div className="mr-4 flex items-center gap-4 text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<BookmarkIcon className="size-3.5" />
								{stats.total}
							</span>
							<span className="flex items-center gap-1">
								<Heart className="size-3.5" />
								{stats.favorites}
							</span>
							<span className="flex items-center gap-1">
								<Tag className="size-3.5" />
								{stats.tagsCount}
							</span>
						</div>
					)}
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="icon"
						onClick={() => setViewMode("list")}
						title="List View"
					>
						<List data-icon="inline-start" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="icon"
						onClick={() => setViewMode("grid")}
						title="Grid View"
					>
						<LayoutGrid data-icon="inline-start" />
					</Button>
				</div>
			</header>

			{/* Active filter chips */}
			{hasActiveFilters && (
				<div className="flex flex-wrap items-center gap-2 border-b px-6 py-2">
					<span className="text-xs text-muted-foreground font-medium">
						Filters:
					</span>
					{selectedTags.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
						>
							{tag}
							<button
								onClick={() => toggleTagParam(tag)}
								className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
							>
								<X className="size-3" />
							</button>
						</span>
					))}
					<button
						onClick={clearTagFilters}
						className="ml-1 text-xs text-muted-foreground hover:text-foreground"
					>
						Clear all
					</button>
				</div>
			)}

			<div className="flex-1 overflow-y-auto">{renderContent()}</div>

			<EditBookmarkDialog
				bookmark={
					filteredBookmarks.find((b: any) => b.id === editingBookmark) || null
				}
				isOpen={!!editingBookmark}
				onClose={handleCloseEdit}
			/>
		</div>
	);
}
