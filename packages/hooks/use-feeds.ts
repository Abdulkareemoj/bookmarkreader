import { type ReaderState } from "@packages/store";
import { type UseBoundStore, type StoreApi } from "zustand";

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
    const addArticles = useStore((state) => state.addArticles);
    const toggleArticleRead = useStore((state) => state.toggleArticleRead);
    const toggleArticleLike = useStore((state) => state.toggleArticleLike);
    const toggleArticleSave = useStore((state) => state.toggleArticleSave);

    return {
      feeds,
      articles,
      addFeed,
      removeFeed,
      addArticles,
      toggleArticleRead,
      toggleArticleLike,
      toggleArticleSave,
    };
  };
};
