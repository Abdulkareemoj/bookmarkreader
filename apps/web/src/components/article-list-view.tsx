import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import ArticleCard from "@/components/article-card";

interface Article {
	id: string;
	title: string;
	subtitle?: string;
	excerpt?: string;
	category: string;
	readTime: number;
	author: string;
	date: string;
	tags?: string[];
	liked?: boolean;
	saved?: boolean;
	onLike?: () => void;
	onSave?: () => void;
	onShare?: () => void;
}

interface ArticleListViewProps {
	articles: Article[];
	onLike?: (id: string) => void;
	onSave?: (id: string) => void;
	onShare?: (id: string) => void;
}

export default function ArticleListView({
	articles,
	onLike,
	onSave,
	onShare,
}: ArticleListViewProps) {
    const search = useRouterState({ select: (s) => (s.location.search as any)?.q ?? "" });

	const filteredArticles = useMemo(() => {
        const q = typeof search === "string" ? search.trim().toLowerCase() : "";
        if (!q) return articles;
		return articles.filter(
			(article) =>
                article.title.toLowerCase().includes(q) ||
                article.subtitle?.toLowerCase().includes(q) ||
                article.excerpt?.toLowerCase().includes(q) ||
                article.author.toLowerCase().includes(q) ||
                article.tags?.some((tag) => tag.toLowerCase().includes(q)),
		);
    }, [articles, search]);

	return (
		<div className="flex h-full w-full flex-col">
			{/* Articles Grid */}
			<div className="flex-1 overflow-y-auto p-6">
				{filteredArticles.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredArticles.map((article) => (
							<Link
								key={article.id}
								to="/rss/article/$id"
								params={{ id: article.id }}
								className="block"
							>
								<ArticleCard
									id={article.id}
									title={article.title}
									excerpt={article.subtitle || article.excerpt || ""}
									category={article.category}
									readTime={article.readTime}
									author={article.author}
									date={article.date}
									liked={article.liked}
									saved={article.saved}
									onLike={() => onLike?.(article.id)}
									onSave={() => onSave?.(article.id)}
									onShare={() => onShare?.(article.id)}
								/>
							</Link>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<p className="mb-2 text-muted-foreground">No articles found</p>
							<p className="text-muted-foreground text-sm">
                                {search
									? "Try adjusting your search query"
									: "No articles available"}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
