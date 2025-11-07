import ArticleCard from "@/components/rss/article-card";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  author: string;
  date: string;
}

interface ArticleListProps {
  articles: Article[];
  onArticleClick?: (id: string) => void;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  likedArticles?: string[];
  savedArticles?: string[];
}

export default function ArticleList({
  articles,
  onArticleClick,
  onLike,
  onSave,
  onShare,
  likedArticles = [],
  savedArticles = [],
}: ArticleListProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
          liked={likedArticles.includes(article.id)}
          saved={savedArticles.includes(article.id)}
          onClick={() => onArticleClick?.(article.id)}
          onLike={() => onLike?.(article.id)}
          onSave={() => onSave?.(article.id)}
          onShare={() => onShare?.(article.id)}
        />
      ))}
    </div>
  );
}
