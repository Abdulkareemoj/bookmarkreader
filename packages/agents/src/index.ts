// @packages/agents/src/index.ts
// Pure database agents — no extractus, no network calls beyond what's needed
// Safe for all platforms including React Native / Hermes

import type { DB } from "@packages/db/src/index";
import type {
	NewArticle,
	NewBookmark,
	NewFeed,
	Bookmark,
	Feed,
	Article,
	Highlight,
	Annotation,
} from "@packages/db/src/schema";
import {
	articles,
	bookmarks,
	feeds,
	highlights,
	annotations,
} from "@packages/db/src/schema";
import { and, eq, inArray } from "drizzle-orm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function stableId(prefix: string, input: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash =
			(hash +
				((hash << 1) +
					(hash << 4) +
					(hash << 7) +
					(hash << 8) +
					(hash << 24))) >>>
			0;
	}
	return `${prefix}_${hash.toString(16)}`;
}

function now(): string {
	return new Date().toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Bookmark, Feed, Article };

// ─── Sync Types ───────────────────────────────────────────────────────────────

export interface SyncData {
	version: number;
	exportedAt: string;
	bookmarks: Bookmark[];
	feeds: Feed[];
	articles: Article[];
	highlights: (Highlight & { annotations: Annotation[] })[];
}

export interface SyncResult {
	success: boolean;
	syncedAt: string;
	bookmarksPushed: number;
	bookmarksPulled: number;
	feedsPushed: number;
	feedsPulled: number;
	articlesPushed: number;
	articlesPulled: number;
	errors: string[];
}

export type SyncProvider = "gdrive" | "dropbox" | "icloud" | "none";
export type AuthProvider = "gdrive" | "dropbox" | "none";

export interface AuthResult {
	success: boolean;
	provider: AuthProvider;
	accessToken: string | null;
	refreshToken?: string | null;
	error?: string;
}

export interface AuthUserInfo {
	email: string;
	name?: string;
	picture?: string;
}

// ─── Auth Agent ────────────────────────────────────────────────────────────────

export interface IAuthAgent {
	signIn(provider: AuthProvider): Promise<AuthResult>;
	signOut(): Promise<void>;
	getAccessToken(): Promise<string | null>;
	isSignedIn(): Promise<boolean>;
	getProvider(): Promise<AuthProvider>;
	getUserInfo(): Promise<AuthUserInfo | null>;
}

// ─── Sync Agent ───────────────────────────────────────────────────────────────

export interface ISyncAgent {
	sync(): Promise<SyncResult>;
	startAutoSync(intervalMs: number): void;
	stopAutoSync(): void;
	exportToFile(): Promise<string>;
	importFromFile(
		data: SyncData,
		mode: "merge" | "replace",
	): Promise<void>;
	getSyncFilePath(): string | null;
}

export interface ParsedArticle {
	feedId: string;
	title: string;
	link: string;
	content?: string;
	contentSnippet?: string;
	imageUrl?: string;
	pubDate: string;
	read: boolean;
	liked: boolean;
	saved: boolean;
	lastUpdatedAt: string;
}

// ─── Bookmark Agent ───────────────────────────────────────────────────────────

export interface IBookmarkAgent {
	addBookmark(data: Omit<NewBookmark, "id" | "dateAdded">): Promise<Bookmark>;
	getBookmark(id: string): Promise<Bookmark | undefined>;
	listBookmarks(collectionId?: string): Promise<Bookmark[]>;
	updateBookmark(
		id: string,
		data: Partial<Omit<NewBookmark, "id">>,
	): Promise<Bookmark>;
	deleteBookmark(id: string): Promise<void>;
	toggleFavorite(id: string): Promise<void>;
	toggleLiked(id: string): Promise<void>;
	toggleSaved(id: string): Promise<void>;
	addTag(id: string, tag: string): Promise<void>;
}

export function createBookmarkAgent(db: DB): IBookmarkAgent {
	const q = db as any;
	return {
		addBookmark: async (data) => {
			const [row] = await q
				.insert(bookmarks)
				.values({
					...data,
					id: randomId("bkm"),
					dateAdded: now(),
					lastUpdatedAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add bookmark.");
			return row;
		},
		getBookmark: async (id) => {
			const [row] = await q
				.select()
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			return row;
		},
		listBookmarks: async (collectionId) => {
			if (collectionId && collectionId !== "all") {
				return q
					.select()
					.from(bookmarks)
					.where(eq(bookmarks.collectionId, collectionId));
			}
			return q.select().from(bookmarks);
		},
		updateBookmark: async (id, data) => {
			const [row] = await q
				.update(bookmarks)
				.set({ ...data, lastUpdatedAt: now() })
				.where(eq(bookmarks.id, id))
				.returning();
			if (!row) throw new Error(`Bookmark ${id} not found.`);
			return row;
		},
		deleteBookmark: async (id) => {
			await q.delete(bookmarks).where(eq(bookmarks.id, id));
		},
		toggleFavorite: async (id) => {
			const [cur] = await q
				.select({ favorite: bookmarks.favorite })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ favorite: !cur.favorite, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		toggleLiked: async (id) => {
			const [cur] = await q
				.select({ liked: bookmarks.liked })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ liked: !cur.liked, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		toggleSaved: async (id) => {
			const [cur] = await q
				.select({ saved: bookmarks.saved })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (cur)
				await q
					.update(bookmarks)
					.set({ saved: !cur.saved, lastUpdatedAt: now() })
					.where(eq(bookmarks.id, id));
		},
		addTag: async (id, tag) => {
			const [cur] = await q
				.select({ tags: bookmarks.tags })
				.from(bookmarks)
				.where(eq(bookmarks.id, id))
				.limit(1);
			if (!cur) throw new Error(`Bookmark ${id} not found.`);
			const existing: string[] = Array.isArray(cur.tags) ? cur.tags : [];
			if (existing.includes(tag)) return;
			await q
				.update(bookmarks)
				.set({ tags: [...existing, tag], lastUpdatedAt: now() })
				.where(eq(bookmarks.id, id));
		},
	};
}

// ─── RSS Agent ────────────────────────────────────────────────────────────────

export interface IRssAgent {
	addFeed(data: Omit<NewFeed, "id">): Promise<Feed>;
	removeFeed(id: string): Promise<void>;
	listFeeds(): Promise<Feed[]>;
	// refreshFeed is platform-specific — handled by the store layer
	// which calls insertArticles after platform-specific parsing
	insertArticles(parsed: ParsedArticle[]): Promise<Article[]>;
	updateFeedMeta(
		id: string,
		meta: { title?: string; lastFetched?: string; unreadCount?: number },
	): Promise<void>;
	listArticles(feedId?: string): Promise<Article[]>;
	markArticleRead(id: string, read: boolean, readAt?: string): Promise<void>;
	toggleArticleLike(id: string): Promise<void>;
	toggleArticleSave(id: string): Promise<void>;
	updateArticleContent(
		id: string,
		fullContent: string,
		imageUrl?: string | null,
	): Promise<void>;
}

export function createRssAgent(db: DB): IRssAgent {
	const q = db as any;
	return {
		addFeed: async (data) => {
			const existing = await q
				.select()
				.from(feeds)
				.where(eq(feeds.feedUrl, data.feedUrl))
				.limit(1);
			if (existing[0]) return existing[0];
			const [row] = await q
				.insert(feeds)
				.values({
					...data,
					id: randomId("feed"),
					unreadCount: 0,
					lastUpdatedAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add feed.");
			return row;
		},
		removeFeed: async (id) => {
			await q.delete(feeds).where(eq(feeds.id, id));
		},
		listFeeds: async () => {
			return q.select().from(feeds);
		},
		insertArticles: async (parsed) => {
			if (!parsed.length) return [];

			const links = parsed.map((a) => a.link).filter(Boolean);
			const existing = await q
				.select({
					link: articles.link,
					id: articles.id,
					imageUrl: articles.imageUrl,
				})
				.from(articles)
				.where(inArray(articles.link, links));

			const existingByLink = new Map(existing.map((e: any) => [e.link, e]));
			const timestamp = now();

			// Backfill imageUrl on existing articles missing it
			for (const p of parsed) {
				const ex = existingByLink.get(p.link) as any;
				if (ex && !ex.imageUrl && p.imageUrl) {
					await q
						.update(articles)
						.set({ imageUrl: p.imageUrl, lastUpdatedAt: timestamp })
						.where(eq(articles.id, ex.id));
				}
			}

			const newRows: NewArticle[] = parsed
				.filter((a) => !existingByLink.has(a.link))
				.map((a) => ({
					...a,
					id: stableId("article", `${a.feedId}|${a.link}`),
					lastUpdatedAt: timestamp,
				}));

			if (!newRows.length) return [];

			const inserted = await q
				.insert(articles)
				.values(newRows)
				.onConflictDoNothing()
				.returning();

			return inserted;
		},
		updateFeedMeta: async (id, meta) => {
			await q
				.update(feeds)
				.set({ ...meta, lastUpdatedAt: now() })
				.where(eq(feeds.id, id));
		},
		listArticles: async (feedId) => {
			if (feedId)
				return q.select().from(articles).where(eq(articles.feedId, feedId));
			return q.select().from(articles);
		},
		markArticleRead: async (id, read, readAt) => {
			await q
				.update(articles)
				.set({ read, readAt: readAt ?? null, lastUpdatedAt: now() })
				.where(eq(articles.id, id));
		},
		toggleArticleLike: async (id) => {
			const [cur] = await q
				.select({ liked: articles.liked })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (cur)
				await q
					.update(articles)
					.set({ liked: !cur.liked, lastUpdatedAt: now() })
					.where(eq(articles.id, id));
		},
		toggleArticleSave: async (id) => {
			const [cur] = await q
				.select({ saved: articles.saved })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (cur)
				await q
					.update(articles)
					.set({ saved: !cur.saved, lastUpdatedAt: now() })
					.where(eq(articles.id, id));
		},
		updateArticleContent: async (id, fullContent, imageUrl) => {
			await q
				.update(articles)
				.set({
					fullContent,
					...(imageUrl !== undefined ? { imageUrl } : {}),
					lastUpdatedAt: now(),
				})
				.where(eq(articles.id, id));
		},
	};
}

// ─── Highlight Agent ─────────────────────────────────────────────────────────

export interface IHighlightAgent {
	listHighlights(articleId?: string): Promise<Highlight[]>;
	listAnnotations(highlightId: string): Promise<Annotation[]>;
	addHighlight(data: {
		articleId: string;
		text: string;
		color: string;
		id?: string;
	}): Promise<Highlight>;
	removeHighlight(id: string): Promise<void>;
	addAnnotation(data: {
		highlightId: string;
		text: string;
		id?: string;
	}): Promise<Annotation>;
	removeAnnotation(id: string): Promise<void>;
}

export function createHighlightAgent(db: DB): IHighlightAgent {
	const q = db as any;

	const listAnnotations = async (highlightId: string) => {
		return q
			.select()
			.from(annotations)
			.where(eq(annotations.highlightId, highlightId));
	};

	return {
		listHighlights: async (articleId) => {
			if (articleId) {
				return q
					.select()
					.from(highlights)
					.where(eq(highlights.articleId, articleId));
			}
			return q.select().from(highlights);
		},

		listAnnotations,

		addHighlight: async (data) => {
			const [row] = await q
				.insert(highlights)
				.values({
					articleId: data.articleId,
					text: data.text,
					color: data.color,
					id: data.id ?? randomId("hl"),
					createdAt: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add highlight.");
			return row;
		},

		removeHighlight: async (id) => {
			await q.delete(highlights).where(eq(highlights.id, id));
		},

		addAnnotation: async (data) => {
			const [row] = await q
				.insert(annotations)
				.values({
					highlightId: data.highlightId,
					text: data.text,
					id: data.id ?? randomId("ann"),
					timestamp: now(),
				})
				.returning();
			if (!row) throw new Error("Failed to add annotation.");
			return row;
		},

		removeAnnotation: async (id) => {
			await q.delete(annotations).where(eq(annotations.id, id));
		},
	};
}

// ─── IAgents ─────────────────────────────────────────────────────────────────

export interface IAgents {
	bookmarkAgent: IBookmarkAgent;
	rssAgent: IRssAgent;
	highlightAgent: IHighlightAgent;
	syncAgent: ISyncAgent;
	authAgent: IAuthAgent;
}
