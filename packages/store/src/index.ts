import { create } from "zustand";
import type { StoreApi, UseBoundStore } from "zustand";
import type { IBookmarkAgent, IRssAgent } from "@packages/utils";
import { extractArticleContent, needsFullContent } from "@packages/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Highlight {
	id: string;
	articleId: string;
	text: string;
	color: string;
	annotations: Array<{ id: string; text: string; timestamp: string }>;
}

// Derive from agent return types so they stay in sync with the DB schema
export type Bookmark = Awaited<
	ReturnType<IBookmarkAgent["listBookmarks"]>
>[number];
export type Feed = Awaited<ReturnType<IRssAgent["listFeeds"]>>[number];
export type Article = Awaited<ReturnType<IRssAgent["listArticles"]>>[number];

// ─── State interface ──────────────────────────────────────────────────────────

export interface ReaderState {
	// Agents
	bookmarkAgent: IBookmarkAgent;
	rssAgent: IRssAgent;

	// Data
	highlights: Highlight[];
	bookmarks: Bookmark[];
	feeds: Feed[];
	articles: Article[];

	// Init
	loadInitialData: () => Promise<void>;

	// Highlights
	addHighlight: (h: Highlight) => void;
	removeHighlight: (id: string) => void;
	addAnnotation: (
		highlightId: string,
		annotation: { id: string; text: string; timestamp: string },
	) => void;
	removeAnnotation: (highlightId: string, annotationId: string) => void;

	// Bookmarks
	addBookmark: (
		data: Parameters<IBookmarkAgent["addBookmark"]>[0],
	) => Promise<void>;
	updateBookmark: (
		...args: Parameters<IBookmarkAgent["updateBookmark"]>
	) => Promise<void>;
	removeBookmark: (id: string) => Promise<void>;
	toggleBookmarkLike: (id: string) => Promise<void>;
	toggleBookmarkSave: (id: string) => Promise<void>;
	toggleBookmarkFavorite: (id: string) => Promise<void>;

	// Feeds
	addFeed: (data: Parameters<IRssAgent["addFeed"]>[0]) => Promise<void>;
	removeFeed: (id: string) => Promise<void>;
	refreshFeed: (id: string) => Promise<void>;

	// Articles
	markArticleRead: (id: string, read: boolean) => Promise<void>;
	toggleArticleLike: (id: string) => Promise<void>;
	toggleArticleSave: (id: string) => Promise<void>;

	// Full content extraction (lazy, persisted)
	fetchArticleContent: (id: string) => Promise<void>;
}

// ─── Unread count helper ──────────────────────────────────────────────────────

function withUnreadCounts(feedList: Feed[], articleList: Article[]): Feed[] {
	const unreadMap = new Map<string, number>();
	for (const a of articleList) {
		if (!a.read) unreadMap.set(a.feedId, (unreadMap.get(a.feedId) ?? 0) + 1);
	}
	return feedList.map((f) => ({ ...f, unreadCount: unreadMap.get(f.id) ?? 0 }));
}

// ─── Store factory ────────────────────────────────────────────────────────────

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

	// ── Init ────────────────────────────────────────────────────────────────────

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

	// ── Highlights ───────────────────────────────────────────────────────────────

	addHighlight: (h) => set((s) => ({ highlights: [...s.highlights, h] })),

	removeHighlight: (id) =>
		set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) })),

	addAnnotation: (highlightId, annotation) =>
		set((s) => ({
			highlights: s.highlights.map((h) =>
				h.id === highlightId
					? { ...h, annotations: [...h.annotations, annotation] }
					: h,
			),
		})),

	removeAnnotation: (highlightId, annotationId) =>
		set((s) => ({
			highlights: s.highlights.map((h) =>
				h.id === highlightId
					? {
							...h,
							annotations: h.annotations.filter((a) => a.id !== annotationId),
						}
					: h,
			),
		})),

	// ── Bookmarks ────────────────────────────────────────────────────────────────

	addBookmark: async (data) => {
		const newBookmark = await get().bookmarkAgent.addBookmark(data);
		set((s) => ({ bookmarks: [newBookmark, ...s.bookmarks] }));
	},

	updateBookmark: async (id, data) => {
		const updated = await get().bookmarkAgent.updateBookmark(id, data);
		set((s) => ({
			bookmarks: s.bookmarks.map((b) => (b.id === id ? updated : b)),
		}));
	},

	removeBookmark: async (id) => {
		await get().bookmarkAgent.deleteBookmark(id);
		set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
	},

	toggleBookmarkLike: async (id) => {
		await get().bookmarkAgent.toggleLiked(id);
		set((s) => ({
			bookmarks: s.bookmarks.map((b) =>
				b.id === id ? { ...b, liked: !b.liked } : b,
			),
		}));
	},

	toggleBookmarkSave: async (id) => {
		await get().bookmarkAgent.toggleSaved(id);
		set((s) => ({
			bookmarks: s.bookmarks.map((b) =>
				b.id === id ? { ...b, saved: !b.saved } : b,
			),
		}));
	},

	toggleBookmarkFavorite: async (id) => {
		await get().bookmarkAgent.toggleFavorite(id);
		set((s) => ({
			bookmarks: s.bookmarks.map((b) =>
				b.id === id ? { ...b, favorite: !b.favorite } : b,
			),
		}));
	},

	// ── Feeds ────────────────────────────────────────────────────────────────────

	addFeed: async (data) => {
		// createRssAgent.addFeed now auto-fetches title + siteUrl
		const newFeed = await get().rssAgent.addFeed(data);
		set((s) => ({
			feeds: [...s.feeds, { ...newFeed, unreadCount: 0 }],
		}));
		// Immediately refresh to pull articles
		await get().refreshFeed(newFeed.id);
	},

	removeFeed: async (id) => {
		await get().rssAgent.removeFeed(id);
		set((s) => ({
			feeds: s.feeds.filter((f) => f.id !== id),
			articles: s.articles.filter((a) => a.feedId !== id),
		}));
	},

	refreshFeed: async (id) => {
		const newArticles = await get().rssAgent.refreshFeed(id);
		// Re-fetch full lists so unread counts and feed titles update correctly
		const [feeds, articles] = await Promise.all([
			get().rssAgent.listFeeds(),
			get().rssAgent.listArticles(),
		]);
		set(() => ({
			feeds: withUnreadCounts(feeds, articles),
			articles,
		}));
	},

	// ── Articles ─────────────────────────────────────────────────────────────────

	markArticleRead: async (id, read) => {
		const now = read ? new Date().toISOString() : undefined;
		await get().rssAgent.markArticleRead(id, read, now);

		set((s) => {
			const updatedArticles = s.articles.map((a) =>
				a.id === id ? { ...a, read, readAt: now ?? null } : a,
			);
			// Recalculate unread counts in memory
			return {
				articles: updatedArticles,
				feeds: withUnreadCounts(s.feeds, updatedArticles),
			};
		});
	},

	toggleArticleLike: async (id) => {
		await get().rssAgent.toggleArticleLike(id);
		set((s) => ({
			articles: s.articles.map((a) =>
				a.id === id ? { ...a, liked: !a.liked } : a,
			),
		}));
	},

	toggleArticleSave: async (id) => {
		await get().rssAgent.toggleArticleSave(id);
		set((s) => ({
			articles: s.articles.map((a) =>
				a.id === id ? { ...a, saved: !a.saved } : a,
			),
		}));
	},

	// ── Full content extraction ───────────────────────────────────────────────────

	fetchArticleContent: async (id) => {
		const article = get().articles.find((a) => a.id === id);
		if (!article || !needsFullContent(article) || !article.link) return;

		const extracted = await extractArticleContent(article.link);
		if (!extracted?.content) return;

		await get().rssAgent.updateArticleContent(id, extracted.content);

		set((s) => ({
			articles: s.articles.map((a) =>
				a.id === id
					? {
							...a,
							fullContent: extracted.content,
							// Backfill image if we got one and didn't have one
							imageUrl: a.imageUrl ?? extracted.image ?? null,
						}
					: a,
			),
		}));
	},
});

// ─── Store singleton ──────────────────────────────────────────────────────────

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
	if (!readerStore) {
		throw new Error("useReaderStore called before initializeReaderStore.");
	}
	return readerStore(selector);
}

// Also export the raw store for apps that need the full instance
export function getReaderStore() {
	return readerStore;
}

export * from "./settings-store";
export * from "./collections-store";