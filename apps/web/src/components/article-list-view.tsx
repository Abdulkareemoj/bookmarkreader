import { useMemo, useState } from "react";
import ArticleCard from "@/components/article-card";
import SearchBar from "@/components/search-bar";

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
	onArticleSelect?: (article: Article) => void;
	onLike?: (id: string) => void;
	onSave?: (id: string) => void;
	onShare?: (id: string) => void;
}

export default function ArticleListView({
	articles,
	onArticleSelect,
	onLike,
	onSave,
	onShare,
}: ArticleListViewProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredArticles = useMemo(() => {
		if (!searchQuery.trim()) return articles;

		const query = searchQuery.toLowerCase();
		return articles.filter(
			(article) =>
				article.title.toLowerCase().includes(query) ||
				article.subtitle?.toLowerCase().includes(query) ||
				article.excerpt?.toLowerCase().includes(query) ||
				article.author.toLowerCase().includes(query) ||
				article.tags?.some((tag) => tag.toLowerCase().includes(query)),
		);
	}, [articles, searchQuery]);

	return (
		<div className="flex h-full w-full flex-col">
			{/* Search Bar */}
			<div className="sticky top-0 border-border border-b bg-background/95 p-4 backdrop-blur">
				<SearchBar onSearch={setSearchQuery} />
			</div>

			{/* Articles Grid */}
			<div className="flex-1 overflow-y-auto p-6">
				{filteredArticles.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredArticles.map((article) => (
							<div
								key={article.id}
								onClick={() => onArticleSelect?.(article)}
								className="cursor-pointer"
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
							</div>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<p className="mb-2 text-muted-foreground">No articles found</p>
							<p className="text-muted-foreground text-sm">
								{searchQuery
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
