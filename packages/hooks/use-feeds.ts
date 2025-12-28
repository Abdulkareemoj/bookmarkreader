import type { ReaderState } from "@packages/store";
import type { UseBoundStore, StoreApi } from "zustand";

export const createUseFeeds = (
  useStore: UseBoundStore<StoreApi<ReaderState>>
) => {
  return (feedId?: string) => {
    const allFeeds = useStore((state) => state.feeds);
    const allArticles = useStore((state) => state.articles);

    const feeds = allFeeds;
    const articles = feedId
      ? allArticles.filter((a) => a.feedId === feedId)
      : allArticles;

    const addFeed = useStore((state) => state.addFeed);
    const removeFeed = useStore((state) => state.removeFeed);
    const toggleArticleLike = useStore((state) => state.toggleArticleLike);
    const toggleArticleSave = useStore((state) => state.toggleArticleSave);
    const markArticleRead = useStore((state) => state.markArticleRead);
    const refreshFeed = useStore((state) => state.refreshFeed);

    const toggleArticleRead = (id: string) => {
      const current = allArticles.find((a) => a.id === id);
      if (!current) return;
      void markArticleRead(id, !current.read);
    };

    return {
      feeds,
      articles,
      addFeed,
      removeFeed,
      toggleArticleRead,
      toggleArticleLike,
      toggleArticleSave,
      refreshFeed,
    };
  };
};
