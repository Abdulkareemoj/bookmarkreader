import { Bookmark, Heart, Rss, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
interface ArticleCardProps {
	id: string;
	title: string;
	excerpt: string;
	category: string;
	readTime: number;
	author: string;
	date: string;
	imageUrl?: string;
	imageData?: string;
	feedFavicon?: string;
	liked?: boolean;
	saved?: boolean;
	onLike?: () => void;
	onSave?: () => void;
	onShare?: () => void;
	onClick?: () => void;
}

export default function ArticleCard({
	title,
	excerpt,
	category,
	readTime,
	author,
	date,
	imageUrl,
	imageData,
	feedFavicon,
	liked = false,
	saved = false,
	onLike,
	onSave,
	onShare,
	onClick,
}: ArticleCardProps) {
	const imageSrc = imageData || imageUrl;
	return (
		<article
			onClick={onClick}
			className="group cursor-pointer rounded-lg border border-border bg-card transition-colors hover:bg-card/80"
		>
			<div className="flex flex-col gap-3">
				{/* Image */}
				{imageSrc ? (
					<div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
						<img
							src={imageSrc}
							alt={title}
							className="h-full w-full object-cover"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					</div>
				) : (
					<div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-t-lg bg-muted">
						<Rss className="size-12 text-muted-foreground/50" />
					</div>
				)}

				{/* Header with category and read time */}
				<div className="flex items-center gap-2 px-4 pt-4">
					<Badge variant="secondary" className="text-xs">
						{category}
					</Badge>
					<span className="text-muted-foreground text-xs">
						{readTime} min read
					</span>
				</div>

				{/* Title */}
				<h3 className="line-clamp-2 px-4 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
					{title}
				</h3>

				{/* Excerpt */}
				<p className="line-clamp-2 px-4 text-muted-foreground text-sm">
					{excerpt}
				</p>

				{/* Footer with author, date, and actions */}
				<div className="flex items-center justify-between px-4 pt-2 pb-4">
					<div className="flex items-center gap-2">
						<Avatar className="size-6">
							<AvatarImage src={feedFavicon} />
							<AvatarFallback className="bg-primary/20 text-xs">
								{author.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="text-xs">
							<p className="font-medium text-foreground">{author}</p>
							<p className="text-muted-foreground">{date}</p>
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.stopPropagation();
								onLike?.();
							}}
						>
							<div className="t-icon-swap" data-state={liked ? "b" : "a"}>
								<Heart data-icon="a" className="t-icon" />
								<Heart
									data-icon="b"
									className="t-icon fill-current text-red-500"
								/>
							</div>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.stopPropagation();
								onSave?.();
							}}
						>
							<div className="t-icon-swap" data-state={saved ? "b" : "a"}>
								<Bookmark data-icon="a" className="t-icon" />
								<Bookmark data-icon="b" className="t-icon fill-current" />
							</div>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={(e) => {
								e.stopPropagation();
								onShare?.();
							}}
						>
							<Share2 data-icon="inline-start" />
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
}
