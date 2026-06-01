import {
	Bookmark as BookmarkIcon,
	Copy,
	ExternalLink,
	Heart,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
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

interface BookmarkGridCardProps {
	id: string;
	title: string;
	url?: string;
	description?: string;
	tags?: string[];
	favicon?: string;
	liked: boolean;
	onLike: (id: string) => void;
	onEdit: (id: string) => void;
	onMove: (id: string, collectionId: string) => void;
	onDelete: (id: string) => void;
	onClick: () => void;
}

export function BookmarkGridCard({
	id,
	title,
	url,
	description,
	tags,
	favicon,
	liked,
	onLike,
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

	const handleOpenUrl = () => {
		if (url) {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30">
			{/* Actions Overlay */}
			<div className="absolute top-3 right-3 z-10 flex items-center gap-1">
				<Button
					variant="secondary"
					size="icon-xs"
					className="bg-background/80 backdrop-blur-sm"
					onClick={(e) => {
						e.stopPropagation();
						onLike(id);
					}}
					title={liked ? "Unlike" : "Like"}
				>
					<Heart
						className={cn("size-4", liked && "fill-red-500 text-red-500")}
					/>
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="secondary"
							size="icon-xs"
							className="bg-background/80 backdrop-blur-sm"
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
						<DropdownMenuItem onClick={() => onEdit(id)}>
							<Pencil className="size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onMove(id, "inbox")}>
							<BookmarkIcon className="size-4" />
							Move to Inbox
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<ConfirmationDialog
							title="Confirm Deletion"
							description={`Are you sure you want to delete the bookmark: "${title}"?`}
							onConfirm={() => onDelete(id)}
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

			<button
				type="button"
				className="w-full cursor-pointer text-left"
				onClick={onClick}
			>
				{/* Hero Area - Favicon centered on gradient */}
				<div className="flex h-32 items-center justify-center bg-linear-to-br from-muted/50 to-muted">
					{favicon ? (
						<div className="flex size-12 items-center justify-center rounded-xl bg-background shadow-sm">
							<img
								src={favicon}
								alt={title}
								width={32}
								height={32}
								className="size-8"
								onError={(e) => {
									e.currentTarget.style.display = "none";
								}}
							/>
						</div>
					) : (
						<div className="flex size-12 items-center justify-center rounded-xl bg-background shadow-sm">
							<ExternalLink className="size-6 text-muted-foreground" />
						</div>
					)}
				</div>

				<div className="space-y-2 p-4">
					<h3 className="line-clamp-1 font-medium">{title}</h3>
					{description && (
						<p className="line-clamp-2 text-sm text-muted-foreground">
							{description}
						</p>
					)}
					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-1 pt-1">
							{tags.slice(0, 3).map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
								>
									{tag}
								</span>
							))}
							{tags.length > 3 && (
								<span className="py-0.5 text-[10px] text-muted-foreground">
									+{tags.length - 3} more
								</span>
							)}
						</div>
					)}
				</div>
			</button>
		</div>
	);
}
