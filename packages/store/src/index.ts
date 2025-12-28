import { create } from "zustand";
// @ts-ignore
import type { IBookmarkAgent, IRssAgent } from "@packages/utils";
import type { StoreApi, UseBoundStore } from "zustand";

import {
  useSettingsStore,
  createSettingsStore,
  type SettingsState,
  type SyncStatus,
} from "./settings-store";

// --- Interfaces (Simplified to rely on Drizzle types later) ---
// We keep these interfaces minimal as the agents will handle the full Drizzle types.
export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  annotations: Array<{ id: string; text: string; timestamp: string }>;
}

// We rely on Drizzle types for Bookmark, Feed, Article, but keep them here for compatibility
// with existing app code that imports them from @packages/store.
export type Bookmark = Awaited<ReturnType<IBookmarkAgent["getBookmark"]>> & {
  liked: boolean;
  saved: boolean;
  collectionId: string;
};
export type Feed = Awaited<ReturnType<IRssAgent["listFeeds"]>>[number];
export type Article = Awaited<ReturnType<IRssAgent["listArticles"]>>[number];

export interface ReaderState {
  // Agent Instances (Injected)
  bookmarkAgent: IBookmarkAgent;
  rssAgent: IRssAgent;

  // Data State
  highlights: Highlight[];
  bookmarks: Bookmark[];
  feeds: Feed[];
  articles: Article[];

  // Initialization
  loadInitialData: () => Promise<void>;

  // Highlights Actions
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  addAnnotation: (
    highlightId: string,
    annotation: { id: string; text: string; timestamp: string }
  ) => void;
  removeAnnotation: (highlightId: string, annotationId: string) => void;

  // Data Actions (Delegated to Agents)
  // Bookmarks
  addBookmark: (
    data: Parameters<IBookmarkAgent["addBookmark"]>[0]
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleBookmarkLike: (id: string) => Promise<void>;
  toggleBookmarkSave: (id: string) => Promise<void>;

  // RSS Feeds
  addFeed: (data: Parameters<IRssAgent["addFeed"]>[0]) => Promise<void>;
  removeFeed: (id: string) => Promise<void>;
  refreshFeed: (id: string) => Promise<void>;

  // Articles
  markArticleRead: (id: string, read: boolean) => Promise<void>;
  toggleArticleLike: (id: string) => Promise<void>;
  toggleArticleSave: (id: string) => Promise<void>;

  // Reader preferences
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

// Helper to calculate initial unread counts (kept for reference, but not used in final store)
const calculateInitialUnreadCounts = (
  feeds: Omit<Feed, "unreadCount">[],
  articles: Article[]
): Feed[] => {
  const unreadMap = articles.reduce((acc, article) => {
    if (!article.read) {
      acc.set(article.feedId, (acc.get(article.feedId) || 0) + 1);
    }
    return acc;
  }, new Map<string, number>());

  return feeds.map((feed) => ({
    ...feed,
    unreadCount: unreadMap.get(feed.id) || 0,
  }));
};

// We define a factory function that accepts the initialized agents
export const createReaderStore = (
  set: any,
  get: () => ReaderState,
  initialAgents: { bookmarkAgent: IBookmarkAgent; rssAgent: IRssAgent }
): ReaderState => ({
  // Injected Agents
  bookmarkAgent: initialAgents.bookmarkAgent,
  rssAgent: initialAgents.rssAgent,

  // Initial Data State (Empty, to be populated by loadInitialData)
  highlights: [],
  bookmarks: [],
  feeds: [],
  articles: [],
  theme: "dark" as "light" | "dark",

  // Initialization Action
  loadInitialData: async () => {
    const { bookmarkAgent, rssAgent } = get();
    const [bookmarks, feeds, articles] = await Promise.all([
      bookmarkAgent.listBookmarks(),
      rssAgent.listFeeds(),
      rssAgent.listArticles(),
    ]);

    // Calculate unread counts based on fetched articles
    const feedsWithCounts = calculateInitialUnreadCounts(feeds, articles);

    set({ bookmarks, feeds: feedsWithCounts, articles });
  },

  // Highlights Actions (Unchanged)
  addHighlight: (highlight: Highlight) =>
    set((state: ReaderState) => ({
      highlights: [...state.highlights, highlight],
    })),
  removeHighlight: (id: string) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),
  addAnnotation: (
    highlightId: string,
    annotation: { id: string; text: string; timestamp: string }
  ) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId
          ? { ...h, annotations: [...h.annotations, annotation] }
          : h
      ),
    })),
  removeAnnotation: (highlightId: string, annotationId: string) =>
    set((state: ReaderState) => ({
      highlights: state.highlights.map((h) =>
        h.id === highlightId
          ? {
              ...h,
              annotations: h.annotations.filter((a) => a.id !== annotationId),
            }
          : h
      ),
    })),

  // Data Actions (Delegated to Agents)
  addBookmark: async (data) => {
    const newBookmark = await get().bookmarkAgent.addBookmark(data);
    set((state: ReaderState) => ({
      bookmarks: [...state.bookmarks, newBookmark],
    }));
  },
  removeBookmark: async (id) => {
    await get().bookmarkAgent.deleteBookmark(id);
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));
  },
  toggleBookmarkLike: async (id) => {
    await get().bookmarkAgent.toggleFavorite(id); // Using favorite for like/save toggle
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, liked: !b.liked } : b
      ),
    }));
  },
  toggleBookmarkSave: async (id) => {
    // Assuming 'saved' is handled by the 'favorite' field in the current schema
    await get().bookmarkAgent.toggleFavorite(id);
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, saved: !b.saved } : b
      ),
    }));
  },

  // RSS Feeds Actions
  addFeed: async (data) => {
    const newFeed = await get().rssAgent.addFeed(data);
    set((state: ReaderState) => ({
      feeds: [...state.feeds, { ...newFeed, unreadCount: 0 }],
    }));
  },
  removeFeed: async (id) => {
    await get().rssAgent.removeFeed(id);
    set((state: ReaderState) => ({
      feeds: state.feeds.filter((f) => f.id !== id),
      articles: state.articles.filter((a) => a.feedId !== id),
    }));
  },
  refreshFeed: async (id) => {
    await get().rssAgent.refreshFeed(id);

    const [feeds, articles] = await Promise.all([
      get().rssAgent.listFeeds(),
      get().rssAgent.listArticles(),
    ]);

    const feedsWithCounts = calculateInitialUnreadCounts(feeds, articles);
    set({ feeds: feedsWithCounts, articles });
  },

  // Articles Actions
  markArticleRead: async (id, read) => {
    await get().rssAgent.markArticleRead(id, read);
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, read: read } : a
      ),
      // Feed count update logic is complex and deferred
    }));
  },
  toggleArticleLike: async (id) => {
    await get().rssAgent.toggleArticleLike(id);
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, liked: !a.liked } : a
      ),
    }));
  },
  toggleArticleSave: async (id) => {
    await get().rssAgent.toggleArticleSave(id);
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, saved: !a.saved } : a
      ),
    }));
  },

  // Reader preferences Actions
  setTheme: (theme: "light" | "dark") => set({ theme }),
});

// Define a variable to hold the initialized store instance
let readerStore: UseBoundStore<StoreApi<ReaderState>> | null = null;

// Function to initialize the store with agents
export function initializeReaderStore(initialAgents: {
  bookmarkAgent: IBookmarkAgent;
  rssAgent: IRssAgent;
}) {
  if (readerStore) {
    return readerStore;
  }
  // @ts-ignore
  readerStore = create<ReaderState>()((set, get) =>
    createReaderStore(set, get, initialAgents)
  );
  return readerStore;
}

// Custom hook to access the initialized store
export function useReaderStore<T>(selector: (state: ReaderState) => T): T {
  if (!readerStore) {
    // This should be caught by the StoreProvider wrapper in the app entry point
    throw new Error(
      "useReaderStore must be called after initializeReaderStore"
    );
  }
  // @ts-ignore - Suppress complex Zustand type errors related to generic T
  return readerStore(selector);
}

export {
  useSettingsStore,
  createSettingsStore,
  type SettingsState,
  type SyncStatus,
};
