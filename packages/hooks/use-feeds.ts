import { useReaderStore } from "@packages/store";
import { useMemo } from "react";
import type { ArticleFilterOptions } from "@packages/agents";

/**
 * Hook for accessing feed and article data.
 * Optionally filter to a single feed by passing feedId.
 */
export function useFeeds(feedId?: string) {
	const feeds = useReaderStore((s) => s.feeds);
	const allArticles = useReaderStore((s) => s.articles);
	const rssAgent = useReaderStore((s) => s.rssAgent);

	const articles = useMemo(
		() =>
			feedId ? allArticles.filter((a) => a.feedId === feedId) : allArticles,
		[allArticles, feedId],
	);

	const addFeed = useReaderStore((s) => s.addFeed);
	const removeFeed = useReaderStore((s) => s.removeFeed);
	const refreshFeed = useReaderStore((s) => s.refreshFeed);
	const markArticleRead = useReaderStore((s) => s.markArticleRead);
	const toggleArticleLike = useReaderStore((s) => s.toggleArticleLike);
	const toggleArticleSave = useReaderStore((s) => s.toggleArticleSave);
	const fetchArticleContent = useReaderStore((s) => s.fetchArticleContent);

	const toggleArticleRead = (id: string) => {
		const current = allArticles.find((a) => a.id === id);
		if (!current) return;
		void markArticleRead(id, !current.read);
	};

	const searchArticles = useMemo(
		() => (query: string) => rssAgent.searchArticles(query),
		[rssAgent],
	);

	const listFiltered = useMemo(
		() => (options?: ArticleFilterOptions) =>
			rssAgent.listArticlesFiltered(options),
		[rssAgent],
	);

	return {
		feeds,
		articles,
		addFeed,
		removeFeed,
		refreshFeed,
		toggleArticleRead,
		toggleArticleLike: (id: string) => void toggleArticleLike(id),
		toggleArticleSave: (id: string) => void toggleArticleSave(id),
		fetchArticleContent,
		searchArticles,
		listFiltered,
	};
}
