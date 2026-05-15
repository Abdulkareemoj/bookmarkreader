import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Bookmark,
	Clock,
	ExternalLink,
	Heart,
	MoreVertical,
} from "lucide-react";
import ArticleRenderer from "@/components/rss/article-renderer";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rss/article/$id")({
	component: ArticleReaderComponent,
});

function ArticleReaderComponent() {
	const { id } = Route.useParams();
	const {
		articles,
		feeds,
		toggleArticleLike,
		toggleArticleSave,
		markArticleRead,
	} = useReaderStore();

	const article = articles.find((a) => a.id === id);
	const feed = article ? feeds.find((f) => f.id === article.feedId) : undefined;

	// Mark as read when viewing
	if (article && !article.read) {
		void markArticleRead(id, true);
	}

	if (!article) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="font-semibold text-2xl">Article not found</h1>
					<p className="mt-2 text-muted-foreground">
						The article you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	const title = article.title || "Untitled";
	const content = article.content || article.contentSnippet || "";
	const readTime = Math.ceil(content.length / 5 / 200); // Rough estimate: 200 words per minute
	const date = article.pubDate
		? new Date(article.pubDate).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "";
	const imageUrl = article.imageUrl || undefined;
	const feedTitle = feed?.title || undefined;

	const handleLike = () => {
		void toggleArticleLike(id);
	};

	const handleSave = () => {
		void toggleArticleSave(id);
	};

	const handleBack = () => {
		window.history.back();
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Header */}
			<header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto max-w-4xl px-4 py-4">
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleBack}
							className="text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="size-5" />
						</Button>

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLike}
								className={cn(
									"text-muted-foreground hover:text-foreground",
									article.liked && "text-red-500",
								)}
							>
								<Heart
									className={cn("size-5", article.liked && "fill-current")}
								/>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleSave}
								className={cn(
									"text-muted-foreground hover:text-foreground",
									article.saved && "text-primary",
								)}
							>
								<Bookmark
									className={cn("size-5", article.saved && "fill-current")}
								/>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => window.open(article.link, "_blank")}
								className="text-muted-foreground hover:text-foreground"
							>
								<ExternalLink className="size-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground"
							>
								<MoreVertical className="size-5" />
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Article Content */}
			<main className="flex-1">
				<div className="container mx-auto max-w-4xl px-4 py-8">
					{/* Article Header */}
					<article className="mb-8">
						{feedTitle && (
							<div className="mb-4">
								<span className="font-medium text-primary text-sm">
									{feedTitle}
								</span>
							</div>
						)}

						<h1 className="mb-4 font-bold text-4xl text-foreground leading-tight">
							{title}
						</h1>

						<div className="mb-6 flex items-center gap-4 text-muted-foreground text-sm">
							<div className="flex items-center gap-2">
								<Clock className="size-4" />
								<span>{readTime} min read</span>
							</div>
							<div className="text-border">·</div>
							<div>{date}</div>
						</div>

						{imageUrl && (
							<div className="mb-8 overflow-hidden rounded-xl">
								<img
									src={imageUrl}
									alt={title}
									className="h-auto w-full object-cover"
								/>
							</div>
						)}
					</article>

					{/* Article Body */}
					<div className="prose prose-invert max-w-none">
						<ArticleRenderer content={content} />
					</div>
				</div>
			</main>
		</div>
	);
}
