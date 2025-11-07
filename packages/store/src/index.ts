import { create } from "zustand";

// --- Mock Data Imports (Assuming these exist or will be created in the web app) ---
// Since we cannot import from the web app's lib folder here, I will define simple mock data directly.
const initialBookmarks = [
  {
    id: "b1",
    title: "The State of Frontend 2024",
    url: "https://example.com/frontend-2024",
    tags: ["frontend", "report"],
    collectionId: "work",
    liked: true,
    saved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "b2",
    title: "Zustand Documentation",
    url: "https://zustand-docs.pmnd.rs/",
    tags: ["state", "react"],
    collectionId: "dev",
    liked: false,
    saved: true,
    createdAt: new Date().toISOString(),
  },
];

const initialFeeds = [
  {
    id: "f1",
    title: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    siteUrl: "https://techcrunch.com",
    lastFetched: new Date().toISOString(),
    unreadCount: 1, // Will be calculated by articles
  },
  {
    id: "f2",
    title: "Hacker News",
    feedUrl: "https://hnrss.org/frontpage",
    siteUrl: "https://news.ycombinator.com",
    lastFetched: new Date().toISOString(),
    unreadCount: 2, // Will be calculated by articles
  },
];

const initialArticles = [
  {
    id: "a1",
    feedId: "f1",
    title: "AI Startup Raises $100M in Series B",
    link: "https://techcrunch.com/ai-startup-raises",
    contentSnippet:
      "A new AI company focused on edge computing secured major funding.",
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    liked: false,
    saved: false,
  },
  {
    id: "a2",
    feedId: "f2",
    title: "Show HN: A new bookmark manager built with Tauri",
    link: "https://news.ycombinator.com/item?id=12345",
    contentSnippet:
      "Discussion thread about a new cross-platform bookmark tool.",
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    liked: false,
    saved: true,
  },
  {
    id: "a3",
    feedId: "f2",
    title: "Ask HN: What are your favorite productivity hacks?",
    link: "https://news.ycombinator.com/item?id=67890",
    contentSnippet: "A thread asking for user-submitted productivity tips.",
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    liked: true,
    saved: false,
  },
];
// --- End Mock Data ---

export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  annotations: Array<{ id: string; text: string; timestamp: string }>;
}

export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  tags: string[];
  collectionId: string;
  liked: boolean;
  saved: boolean;
  createdAt: string;
}

export interface Feed {
  id: string;
  title: string;
  feedUrl: string;
  siteUrl?: string;
  lastFetched?: string;
  unreadCount: number;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  link: string;
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  read: boolean;
  liked: boolean;
  saved: boolean;
}

export interface ReaderState {
  // Highlights
  highlights: Highlight[];
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  addAnnotation: (
    highlightId: string,
    annotation: { id: string; text: string; timestamp: string }
  ) => void;
  removeAnnotation: (highlightId: string, annotationId: string) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  toggleBookmarkLike: (id: string) => void;
  toggleBookmarkSave: (id: string) => void;

  // RSS Feeds
  feeds: Feed[];
  articles: Article[];
  addFeed: (feed: Omit<Feed, "unreadCount">) => void;
  removeFeed: (id: string) => void;
  addArticles: (newArticles: Article[]) => void;
  toggleArticleRead: (id: string) => void;
  toggleArticleLike: (id: string) => void;
  toggleArticleSave: (id: string) => void;

  // Reader preferences
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

// Helper to calculate initial unread counts
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

export const createReaderStore = (set: any): ReaderState => ({
  // Initial State
  highlights: [],
  bookmarks: initialBookmarks,
  feeds: calculateInitialUnreadCounts(initialFeeds, initialArticles),
  articles: initialArticles,
  theme: "dark" as "light" | "dark",

  // Highlights Actions
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

  // Bookmarks Actions
  setBookmarks: (bookmarks: Bookmark[]) => set({ bookmarks }),
  addBookmark: (bookmark: Bookmark) =>
    set((state: ReaderState) => ({
      bookmarks: [...state.bookmarks, bookmark],
    })),
  removeBookmark: (id: string) =>
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    })),
  toggleBookmarkLike: (id: string) =>
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, liked: !b.liked } : b
      ),
    })),
  toggleBookmarkSave: (id: string) =>
    set((state: ReaderState) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, saved: !b.saved } : b
      ),
    })),

  // RSS Feeds Actions
  addFeed: (feed: Omit<Feed, "unreadCount">) =>
    set((state: ReaderState) => ({
      feeds: [...state.feeds, { ...feed, unreadCount: 0 }],
    })),
  removeFeed: (id: string) =>
    set((state: ReaderState) => ({
      feeds: state.feeds.filter((f) => f.id !== id),
      articles: state.articles.filter((a) => a.feedId !== id),
    })),
  addArticles: (newArticles: Article[]) =>
    set((state: ReaderState) => {
      // Simple deduplication based on article ID
      const existingIds = new Set(state.articles.map((a) => a.id));
      const uniqueNewArticles = newArticles.filter(
        (a) => !existingIds.has(a.id)
      );

      // Update unread counts for affected feeds
      const updatedFeeds = state.feeds.map((f) => {
        const newCount = uniqueNewArticles.filter(
          (a) => a.feedId === f.id
        ).length;
        return { ...f, unreadCount: f.unreadCount + newCount };
      });

      return {
        articles: [...state.articles, ...uniqueNewArticles],
        feeds: updatedFeeds,
      };
    }),
  toggleArticleRead: (id: string) =>
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, read: !a.read } : a
      ),
      feeds: state.feeds.map((f) => {
        const article = state.articles.find((a) => a.id === id);
        if (article && article.feedId === f.id) {
          return {
            ...f,
            unreadCount: article.read
              ? f.unreadCount + 1 // Was read, now unread
              : f.unreadCount - 1, // Was unread, now read
          };
        }
        return f;
      }),
    })),
  toggleArticleLike: (id: string) =>
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, liked: !a.liked } : a
      ),
    })),
  toggleArticleSave: (id: string) =>
    set((state: ReaderState) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, saved: !a.saved } : a
      ),
    })),

  // Reader preferences Actions
  setTheme: (theme: "light" | "dark") => set({ theme }),
});

// Define and export the main store hook with the correct name
export const useReaderStore = create<ReaderState>(createReaderStore);
