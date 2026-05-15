import {
	Bookmark,
	Copy,
	Edit,
	Heart,
	Link as LinkIcon,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "../confirmation-dialog";

interface BookmarkGridCardProps {
	id: string;
	title: string;
	url?: string;
	favicon?: string;
	image?: string;
	liked: boolean;
	saved: boolean;
	onLike: (id: string) => void;
	onSave: (id: string) => void;
	onEdit: (id: string) => void;
	onMove: (id: string, collectionId: string) => void;
	onDelete: (id: string) => void;
	onClick: () => void;
}

export function BookmarkGridCard({
	id,
	title,
	url,
	favicon,
	image,
	liked,
	saved,
	onLike,
	onSave,
	onDelete,
	onEdit,
	onMove,
	onClick,
}: BookmarkGridCardProps) {
	const handleCopyUrl = () => {
		if (url) {
			void navigator.clipboard.writeText(url);
		}
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<article
					onClick={onClick}
					className="group relative cursor-pointer rounded-lg border border-border bg-card transition-colors hover:bg-card/80"
				>
					{/* Image Section */}
					{image ? (
						<div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
							<img
								src={image}
								alt={title}
								className="h-full w-full object-cover"
								onError={(e) => {
									// Hide image if it fails to load
									e.currentTarget.style.display = "none";
								}}
							/>
						</div>
					) : null}

					<CardHeader className="p-4">
						<CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							{favicon ? (
								<img
									src={favicon}
									alt="Favicon"
									className="size-4 shrink-0"
									onError={(e) => {
										// Hide favicon if it fails to load
										e.currentTarget.style.display = "none";
									}}
								/>
							) : (
								<LinkIcon data-icon="inline-start" className="shrink-0" />
							)}
							<span className="truncate">{url ?? "No URL available"}</span>
						</div>
					</CardContent>

					{/* Actions Overlay */}
					<div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onLike(id);
							}}
							title={liked ? "Unlike" : "Like"}
						>
							<Heart
								data-icon="inline-start"
								className={cn(liked && "fill-current text-red-500")}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onSave(id);
							}}
							title={saved ? "Remove from saved" : "Save"}
						>
							<Bookmark
								data-icon="inline-start"
								className={cn(saved && "fill-current")}
							/>
						</Button>
						<ConfirmationDialog
							title="Confirm Deletion"
							description={`Are you sure you want to delete the bookmark: "${title}"? This action cannot be undone.`}
							onConfirm={() => onDelete(id)}
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
				</article>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={() => onEdit(id)}>
					<Edit data-icon="inline-start" />
					Edit
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onMove(id, "inbox")}>
					<Bookmark data-icon="inline-start" />
					Move to Inbox
				</ContextMenuItem>
				<ContextMenuItem onClick={handleCopyUrl}>
					<Copy data-icon="inline-start" />
					Copy URL
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:text-destructive"
					onClick={() => onDelete(id)}
				>
					<Trash2 data-icon="inline-start" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
