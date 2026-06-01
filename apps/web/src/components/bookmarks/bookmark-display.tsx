import {
	ArrowLeft,
	Copy,
	ExternalLink,
	Heart,
	Link as LinkIcon,
	Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReaderStore } from "@/lib/store";
import { ConfirmationDialog } from "../confirmation-dialog";

interface BookmarkDisplayProps {
	id: string;
	title: string;
	url: string;
	description?: string;
	notes?: string;
	tags?: string[];
	favicon?: string;
	image?: string;
	liked?: boolean;
}

export default function BookmarkDisplay({
	id,
	title,
	url,
	description,
	notes,
	tags = [],
	favicon,
	liked,
}: BookmarkDisplayProps) {
	const { toggleBookmarkLike, removeBookmark } = useReaderStore(
		(state) => state,
	);

	const handleCopyUrl = () => {
		void navigator.clipboard.writeText(url);
	};

	const handleOpenUrl = () => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	return (
		<article className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
			<div className="mb-6 flex items-center justify-between">
				<Button
					variant="outline"
					size="sm"
					onClick={() => window.history.back()}
					className="inline-flex items-center"
				>
					<ArrowLeft className="mr-2 size-4" />
					Back
				</Button>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => toggleBookmarkLike(id)}
						title={liked ? "Unlike" : "Like"}
					>
						<Heart
							className={cn("size-4", liked && "fill-red-500 text-red-500")}
						/>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCopyUrl}
						title="Copy URL"
					>
						<Copy className="size-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleOpenUrl}
						title="Open in new tab"
					>
						<ExternalLink className="size-4" />
					</Button>
					<ConfirmationDialog
						title="Confirm Deletion"
						description={`Are you sure you want to delete the bookmark: "${title}"?`}
						onConfirm={() => {
							void removeBookmark(id);
							window.location.href = "/bookmarks";
						}}
						trigger={
							<Button variant="ghost" size="icon" title="Delete">
								<Trash2 className="size-4" />
							</Button>
						}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex items-start gap-4">
					{favicon ? (
						<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted shadow-sm">
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
						<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted shadow-sm">
							<ExternalLink className="size-6 text-muted-foreground" />
						</div>
					)}
					<div className="flex flex-col gap-2">
						<h1 className="text-balance font-bold text-4xl text-foreground leading-tight md:text-5xl">
							{title}
						</h1>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
						>
							<LinkIcon className="size-4" />
							<span className="truncate">{url}</span>
						</a>
					</div>
				</div>

				{description && <p className="text-muted-foreground">{description}</p>}

				{notes && (
					<div className="prose prose-invert max-w-none">
						<p>{notes}</p>
					</div>
				)}

				{tags.length > 0 && (
					<div className="border-t border-border py-6">
						<p className="mb-3 font-semibold text-sm text-muted-foreground">
							Tags
						</p>
						<div className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</article>
	);
}
