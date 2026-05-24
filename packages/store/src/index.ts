import { create } from "zustand";
import type { StoreApi, UseBoundStore } from "zustand";
import type { IBookmarkAgent, IRssAgent } from "@packages/agents";

// Types

export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  annotations: Array<{ id: string; text: string; timestamp: string }>;
}

export type Bookmark = Awaited<ReturnType<IBookmarkAgent["listBookmarks"]>>[number];
export type Feed = Awaited<ReturnType<IRssAgent["listFeeds"]>>[number];
export type Article = Awaited<ReturnType<IRssAgent["listArticles"]>>[number];

// State interface

export interface ReaderState {
  bookmarkAgent: IBookmarkAgent;
  rssAgent: IRssAgent;

  highlights: Highlight[];
  bookmarks: Bookmark[];
  feeds: Feed[];
  articles: Article[];

  loadInitialData: () => Promise<void>;

  addHighlight: (h: Highlight) => void;
  removeHighlight: (id: string) => void;
  addAnnotation: (highlightId: string, annotation: { id: string; text: string; timestamp: string }) => void;
  removeAnnotation: (highlightId: string, annotationId: string) => void;

  addBookmark: (data: Parameters<IBookmarkAgent["addBookmark"]>[0]) => Promise<void>;
  updateBookmark: (...args: Parameters<IBookmarkAgent["updateBookmark"]>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleBookmarkLike: (id: string) => Promise<void>;
  toggleBookmarkSave: (id: string) => Promise<void>;
  toggleBookmarkFavorite: (id: string) => Promise<void>;

  addFeed: (data: Parameters<IRssAgent["addFeed"]>[0]) => Promise<void>;
  removeFeed: (id: string) => Promise<void>;
  refreshFeed: (id: string) => Promise<void>;

  markArticleRead: (id: string, read: boolean) => Promise<void>;
  toggleArticleLike: (id: string) => Promise<void>;
  toggleArticleSave: (id: string) => Promise<void>;

  //TODO: This is currently implemented in the store for web/desktop using dynamic import of @packages/utils extractArticleContent, but it's really a platform-specific concern and should be moved to mobile-init.ts for mobile and utils/index.ts for web/desktop
  // fetchArticleContent is platform-specific:
  // - Web: implemented in store using @packages/utils extractArticleContent
  // - Mobile: overridden in mobile-init.ts using apps/mobile/lib/rss.ts
  fetchArticleContent: (id: string) => Promise<void>;
}

// Helpers

function withUnreadCounts(feedList: Feed[], articleList: Article[]): Feed[] {
  const unreadMap = new Map<string, number>();
  for (const a of articleList) {
    if (!a.read) unreadMap.set(a.feedId, (unreadMap.get(a.feedId) ?? 0) + 1);
  }
  return feedList.map((f) => ({ ...f, unreadCount: unreadMap.get(f.id) ?? 0 }));
}

// Store factory

export const createReaderStore = (
  set: (fn: (s: ReaderState) => Partial<ReaderState>) => void,
  get: () => ReaderState,
  agents: { bookmarkAgent: IBookmarkAgent; rssAgent: IRssAgent },
): ReaderState => ({
  bookmarkAgent: agents.bookmarkAgent,
  rssAgent: agents.rssAgent,

  highlights: [],
  bookmarks: [],
  feeds: [],
  articles: [],

  loadInitialData: async () => {
    const { bookmarkAgent, rssAgent } = get();
    const [bookmarks, feeds, articles] = await Promise.all([
      bookmarkAgent.listBookmarks(),
      rssAgent.listFeeds(),
      rssAgent.listArticles(),
    ]);
    set(() => ({
      bookmarks,
      feeds: withUnreadCounts(feeds, articles),
      articles,
    }));
  },

  addHighlight: (h) => set((s) => ({ highlights: [...s.highlights, h] })),
  removeHighlight: (id) => set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) })),
  addAnnotation: (highlightId, annotation) =>
    set((s) => ({
      highlights: s.highlights.map((h) =>
        h.id === highlightId ? { ...h, annotations: [...h.annotations, annotation] } : h,
      ),
    })),
  removeAnnotation: (highlightId, annotationId) =>
    set((s) => ({
      highlights: s.highlights.map((h) =>
        h.id === highlightId
          ? { ...h, annotations: h.annotations.filter((a) => a.id !== annotationId) }
          : h,
      ),
    })),

  addBookmark: async (data) => {
    const newBookmark = await get().bookmarkAgent.addBookmark(data);
    set((s) => ({ bookmarks: [newBookmark, ...s.bookmarks] }));
  },
  updateBookmark: async (id, data) => {
    const updated = await get().bookmarkAgent.updateBookmark(id, data);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => (b.id === id ? updated : b)) }));
  },
  removeBookmark: async (id) => {
    await get().bookmarkAgent.deleteBookmark(id);
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
  },
  toggleBookmarkLike: async (id) => {
    await get().bookmarkAgent.toggleLiked(id);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => b.id === id ? { ...b, liked: !b.liked } : b) }));
  },
  toggleBookmarkSave: async (id) => {
    await get().bookmarkAgent.toggleSaved(id);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => b.id === id ? { ...b, saved: !b.saved } : b) }));
  },
  toggleBookmarkFavorite: async (id) => {
    await get().bookmarkAgent.toggleFavorite(id);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => b.id === id ? { ...b, favorite: !b.favorite } : b) }));
  },

  addFeed: async (data) => {
    const newFeed = await get().rssAgent.addFeed(data);
    set((s) => ({ feeds: [...s.feeds, { ...newFeed, unreadCount: 0 }] }));
    await get().refreshFeed(newFeed.id);
  },
  removeFeed: async (id) => {
    await get().rssAgent.removeFeed(id);
    set((s) => ({
      feeds: s.feeds.filter((f) => f.id !== id),
      articles: s.articles.filter((a) => a.feedId !== id),
    }));
  },

  // Default refreshFeed — used by web/desktop via rssAgent.refreshFeed
  // Mobile overrides this in mobile-init.ts with the mobile RSS implementation
  refreshFeed: async (id) => {
    await get().rssAgent.refreshFeed(id);
    const [feeds, articles] = await Promise.all([
      get().rssAgent.listFeeds(),
      get().rssAgent.listArticles(),
    ]);
    set(() => ({ feeds: withUnreadCounts(feeds, articles), articles }));
  },

  markArticleRead: async (id, read) => {
    const now = read ? new Date().toISOString() : undefined;
    await get().rssAgent.markArticleRead(id, read, now);
    set((s) => {
      const updatedArticles = s.articles.map((a) =>
        a.id === id ? { ...a, read, readAt: now ?? null } : a,
      );
      return {
        articles: updatedArticles,
        feeds: withUnreadCounts(s.feeds, updatedArticles),
      };
    });
  },
  toggleArticleLike: async (id) => {
    await get().rssAgent.toggleArticleLike(id);
    set((s) => ({ articles: s.articles.map((a) => a.id === id ? { ...a, liked: !a.liked } : a) }));
  },
  toggleArticleSave: async (id) => {
    await get().rssAgent.toggleArticleSave(id);
    set((s) => ({ articles: s.articles.map((a) => a.id === id ? { ...a, saved: !a.saved } : a) }));
  },

  // Default fetchArticleContent for web/desktop
  fetchArticleContent: async (id) => {
    const article = get().articles.find((a) => a.id === id);
    if (!article || !article.link) return;

    const contentText = (article.content ?? "").replace(/<[^>]*>/g, "").trim();
    if ((article as any).fullContent || contentText.length >= 500) return;

    try {
      const { extractArticleContent, needsFullContent } = await import("@packages/utils");
      if (!needsFullContent(article)) return;

      const extracted = await extractArticleContent(article.link);
      if (!extracted?.content) return;

      const imageUrl = article.imageUrl ?? extracted.image ?? null;
      await get().rssAgent.updateArticleContent(id, extracted.content, imageUrl);

      set((s) => ({
        articles: s.articles.map((a) =>
          a.id === id ? { ...a, fullContent: extracted.content, imageUrl } : a,
        ),
      }));
    } catch (err) {
      console.warn("[fetchArticleContent] Failed:", err);
    }
  },
});

// Store singleton

let readerStore: UseBoundStore<StoreApi<ReaderState>> | null = null;

export function initializeReaderStore(agents: {
  bookmarkAgent: IBookmarkAgent;
  rssAgent: IRssAgent;
}): UseBoundStore<StoreApi<ReaderState>> {
  if (readerStore) return readerStore;
  readerStore = create<ReaderState>()((set, get) =>
    createReaderStore(set as any, get, agents),
  );
  return readerStore;
}

export function useReaderStore<T>(selector: (state: ReaderState) => T): T {
  if (!readerStore) return undefined as unknown as T;
  return readerStore(selector);
}

export function getReaderStore() {
  return readerStore;
}

export * from "./settings-store";
export * from "./collections-store";