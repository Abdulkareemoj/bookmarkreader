import type { Bookmark } from "@packages/store";
import { useRouterState } from "@tanstack/react-router";
import {
	Bookmark as BookmarkIcon,
	Copy,
	ExternalLink,
	Heart,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";

interface BookmarkListViewProps {
	bookmarks: Bookmark[];
	onLike: (id: string) => void;
	onSave: (id: string) => void;
	onDelete: (id: string) => void;
	onEdit: (id: string) => void;
	onMove: (id: string, collectionId: string) => void;
}

function BookmarkListItem({
	bookmark,
	onLike,
	onSave,
	onDelete,
	onEdit,
	onMove,
}: {
	bookmark: Bookmark;
	onLike: (id: string) => void;
	onSave: (id: string) => void;
	onDelete: (id: string) => void;
	onEdit: (id: string) => void;
	onMove: (id: string, collectionId: string) => void;
}) {
	const handleCopyUrl = () => {
		if (bookmark.url) {
			void navigator.clipboard.writeText(bookmark.url);
		}
	};

	const handleOpenUrl = () => {
		window.open(bookmark.url, "_blank", "noopener,noreferrer");
	};

	return (
		<div className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
			<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
				{bookmark.favicon ? (
					<img
						src={bookmark.favicon}
						alt={bookmark.title}
						width={24}
						height={24}
						className="size-6"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				) : (
					<ExternalLink className="size-4 text-muted-foreground" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<h3 className="truncate font-medium">{bookmark.title}</h3>
					{bookmark.tags && bookmark.tags.length > 0 && (
						<div className="hidden items-center gap-1 sm:flex">
							{bookmark.tags.slice(0, 2).map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
								>
									{tag}
								</span>
							))}
							{bookmark.tags.length > 2 && (
								<span className="text-[10px] text-muted-foreground">
									+{bookmark.tags.length - 2}
								</span>
							)}
						</div>
					)}
				</div>
				<p className="truncate text-sm text-muted-foreground">
					{bookmark.url ?? "No URL"}
				</p>
			</div>

			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={(e) => {
						e.stopPropagation();
						onLike(bookmark.id);
					}}
					title={bookmark.liked ? "Unlike" : "Like"}
				>
					<Heart
						className={cn(
							"size-4",
							bookmark.liked && "fill-red-500 text-red-500",
						)}
					/>
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={(e) => {
						e.stopPropagation();
						handleOpenUrl();
					}}
					title="Open in new tab"
				>
					<ExternalLink className="size-4" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleCopyUrl}>
							<Copy className="size-4" />
							Copy URL
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleOpenUrl}>
							<ExternalLink className="size-4" />
							Open in new tab
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit(bookmark.id)}>
							<Pencil className="size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onMove(bookmark.id, "inbox")}>
							<BookmarkIcon className="size-4" />
							Move to Inbox
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<ConfirmationDialog
							title="Confirm Deletion"
							description={`Are you sure you want to delete the bookmark: "${bookmark.title}"?`}
							onConfirm={() => onDelete(bookmark.id)}
							trigger={
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onSelect={(e) => e.preventDefault()}
								>
									<Trash2 className="size-4" />
									Delete
								</DropdownMenuItem>
							}
						/>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export function BookmarkListView({
	bookmarks,
	onLike,
	onDelete,
	onEdit,
	onMove,
	onSave: _onSave,
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
