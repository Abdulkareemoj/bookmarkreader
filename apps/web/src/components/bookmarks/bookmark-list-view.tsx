import type { Bookmark } from "@packages/store";
import { Link, useRouterState } from "@tanstack/react-router";
import {
	Bookmark as BookmarkIcon,
	Copy,
	Heart,
	Link as LinkIcon,
	Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";

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
					{bookmark.image && (
						<img
							src={bookmark.image}
							alt={bookmark.title}
							className="mr-3 size-12 shrink-0 rounded object-cover"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					)}
					<div className="flex min-w-0 flex-col gap-1">
						<span className="truncate font-medium">{bookmark.title}</span>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<LinkIcon data-icon="inline-start" className="shrink-0" />
							<span className="truncate text-xs">
								{bookmark.url ? new URL(bookmark.url).hostname : "No URL"}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onLike(bookmark.id);
							}}
							title={bookmark.liked ? "Unlike" : "Like"}
						>
							<Heart
								data-icon="inline-start"
								className={cn(
									"shrink-0",
									bookmark.liked && "fill-current text-red-500",
								)}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onSave(bookmark.id);
							}}
							title={bookmark.saved ? "Remove from saved" : "Save"}
						>
							<BookmarkIcon
								data-icon="inline-start"
								className={cn("shrink-0", bookmark.saved && "fill-current")}
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
									className="size-8 hover:text-destructive"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									title="Delete"
								>
									<Trash2 data-icon="inline-start" />
								</Button>
							}
						/>
					</div>
				</Link>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={handleCopyUrl}>
					<Copy data-icon="inline-start" />
					Copy URL
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:text-destructive"
					onClick={() => onDelete(bookmark.id)}
				>
					<Trash2 data-icon="inline-start" />
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
				bookmark.tags?.some((tag) => tag.toLowerCase().includes(q)),
		);
	}, [bookmarks, search]);

	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex-1 overflow-y-auto p-6">
				{filteredBookmarks.length > 0 ? (
					<div className="flex flex-col gap-2">
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
							<p className="font-medium text-lg">No bookmarks found</p>
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
