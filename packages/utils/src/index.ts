

import { extract as extractFeed } from "@extractus/feed-extractor";
import { extract as extractArticle } from "@extractus/article-parser";
import type { DB } from "@packages/db/src/index";
import type { NewArticle, NewBookmark, NewFeed } from "@packages/db/src/schema";
import { articles, bookmarks, feeds } from "@packages/db/src/schema";
import type { Article, Bookmark, Feed } from "@packages/store";
import { and, eq, inArray } from "drizzle-orm";

// ─── Network ──────────────────────────────────────────────────────────────────

const CORS_PROXIES = [
	"https://corsproxy.io/?",
	"https://api.allorigins.win/raw?url=",
	"https://api.codetabs.com/v1/proxy?quest=",
];

export async function fetchWithProxy(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	// Try direct first (works in Node/Tauri/desktop where CORS isn't enforced)
	try {
		const res = await fetch(url, options);
		if (res.ok) return res;
	} catch {
		// fall through to proxies
	}

	let lastError: Error | null = null;
	for (const proxy of CORS_PROXIES) {
		try {
			const res = await fetch(proxy + encodeURIComponent(url), {
				...options,
				mode: "cors",
			});
			if (res.ok) return res;
		} catch (e) {
			lastError = e as Error;
			await new Promise((r) => setTimeout(r, 300));
		}
	}

	throw lastError ?? new Error(`Failed to fetch: ${url}`);
}

// ─── ID helpers ───────────────────────────────────────────────────────────────

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

function randomId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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

export const createBookmarkAgent = (db: DB): IBookmarkAgent => {
	const q = db as any;

	const toggleBool = async (id: string, col: any, table: any) => {
		const [row] = await q
			.select({ val: col })
			.from(table)
			.where(eq(col, id))
			.limit(1);
		// Re-fetch by id properly
		const [current] = await q
			.select()
			.from(table)
			.where(eq(table.id, id))
			.limit(1);
		if (!current) return;
		const field = col.name as string;
		await q
			.update(table)
			.set({
				[field]: !current[field],
				lastUpdatedAt: new Date().toISOString(),
			})
			.where(eq(table.id, id));
	};

	return {
		addBookmark: async (data) => {
			const [row] = await q
				.insert(bookmarks)
				.values({
					...data,
					id: randomId("bkm"),
					dateAdded: new Date().toISOString(),
					lastUpdatedAt: new Date().toISOString(),
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
				.set({ ...data, lastUpdatedAt: new Date().toISOString() })
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
					.set({
						favorite: !cur.favorite,
						lastUpdatedAt: new Date().toISOString(),
					})
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
					.set({ liked: !cur.liked, lastUpdatedAt: new Date().toISOString() })
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
					.set({ saved: !cur.saved, lastUpdatedAt: new Date().toISOString() })
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
				.set({
					tags: [...existing, tag],
					lastUpdatedAt: new Date().toISOString(),
				})
				.where(eq(bookmarks.id, id));
		},
	};
};

// ─── RSS Agent ────────────────────────────────────────────────────────────────

export interface IRssAgent {
	addFeed(data: Omit<NewFeed, "id">): Promise<Feed>;
	removeFeed(id: string): Promise<void>;
	listFeeds(): Promise<Feed[]>;
	refreshFeed(id: string): Promise<Article[]>;
	listArticles(feedId?: string): Promise<Article[]>;
	markArticleRead(id: string, read: boolean, readAt?: string): Promise<void>;
	toggleArticleLike(id: string): Promise<void>;
	toggleArticleSave(id: string): Promise<void>;
	updateArticleContent(id: string, fullContent: string): Promise<void>;
}

export const createRssAgent = (db: DB): IRssAgent => {
	const q = db as any;

	return {
		// ── Feed management ──────────────────────────────────────────────────────

		addFeed: async (data) => {
			// Auto-fetch the feed title if not provided or generic
			let title = data.title;
			let siteUrl = data.siteUrl;

			try {
				const res = await fetchWithProxy(data.feedUrl);
				const text = await res.text();
				const feedData = await extractFeed(data.feedUrl, {}, text);

				// Use extracted title if caller didn't provide a real one
				if (!title || title === "New Feed" || title === "Untitled Feed") {
					title = feedData?.title ?? title ?? data.feedUrl;
				}
				// Backfill siteUrl from feed metadata
				if (!siteUrl && feedData?.link) {
					siteUrl = feedData.link;
				}
			} catch (e) {
				console.warn("[addFeed] Could not pre-fetch feed metadata:", e);
			}

			const [newFeed] = await q
				.insert(feeds)
				.values({
					...data,
					title: title ?? data.feedUrl,
					siteUrl: siteUrl ?? data.siteUrl,
					id: randomId("feed"),
					unreadCount: 0,
					lastUpdatedAt: new Date().toISOString(),
				})
				.returning();

			if (!newFeed) throw new Error("Failed to add feed.");
			return newFeed;
		},

		removeFeed: async (id) => {
			await q.delete(feeds).where(eq(feeds.id, id));
		},

		listFeeds: async () => {
			return q.select().from(feeds);
		},

		// ── Refresh — core rewrite ───────────────────────────────────────────────

		refreshFeed: async (id) => {
			const [feed] = await q
				.select()
				.from(feeds)
				.where(eq(feeds.id, id))
				.limit(1);
			if (!feed) throw new Error(`Feed ${id} not found.`);

			// Fetch raw feed text via proxy
			const res = await fetchWithProxy(feed.feedUrl, {
				headers: {
					Accept:
						"application/rss+xml, application/atom+xml, application/json, application/xml, text/xml;q=0.9, */*;q=0.8",
				},
			});
			const rawText = await res.text();

			// Use @extractus/feed-extractor — handles RSS 2.0, Atom, JSON Feed
			const feedData = await extractFeed(feed.feedUrl, {}, rawText);

			if (!feedData?.entries?.length) {
				console.log("[refreshFeed] No entries found for feed:", id);
				return [];
			}

			const now = new Date().toISOString();

			// Map feed-extractor entries to our article shape
			const parsed: Omit<NewArticle, "id">[] = feedData.entries
				.map((entry) => {
					// feed-extractor normalises these across RSS/Atom/JSON Feed
					const link = entry.link ?? "";
					const title = entry.title ?? "(untitled)";
					const content =
						(entry as any).content ?? (entry as any).description ?? "";
					const contentSnippet = content
						? content.replace(/<[^>]*>/g, "").slice(0, 500)
						: "";

					// Image: check enclosures first, then media, then og:image in content
					const enclosure = (entry as any).enclosures?.[0];
					const mediaUrl =
						(entry as any)["media:content"]?.["@_url"] ??
						(entry as any)["media:thumbnail"]?.["@_url"];
					const imgFromContent = content.match(
						/<img[^>]+src=["']([^"']+)["']/i,
					)?.[1];
					const imageUrl: string | undefined =
						(enclosure?.url?.startsWith("http") ? enclosure.url : undefined) ??
						mediaUrl ??
						imgFromContent ??
						undefined;

					const pubDate = entry.published
						? new Date(entry.published).toISOString()
						: now;

					return {
						feedId: id,
						title,
						link,
						content,
						contentSnippet: contentSnippet || undefined,
						imageUrl,
						pubDate,
						read: false,
						liked: false,
						saved: false,
						lastUpdatedAt: now,
					};
				})
				.filter((a) => Boolean(a.link));

			if (parsed.length === 0) return [];

			// Deduplicate against existing articles
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

			// Backfill imageUrl on existing articles that are missing it
			for (const parsed_article of parsed) {
				const ex = existingByLink.get(parsed_article.link);
				if (ex && !ex.imageUrl && parsed_article.imageUrl) {
					await q
						.update(articles)
						.set({ imageUrl: parsed_article.imageUrl, lastUpdatedAt: now })
						.where(eq(articles.id, ex.id));
				}
			}

			// Insert only new articles
			const newRows: NewArticle[] = parsed
				.filter((a) => !existingByLink.has(a.link))
				.map((a) => ({
					...a,
					id: stableId("article", `${id}|${a.link}`),
				}));

			let inserted: Article[] = [];
			if (newRows.length > 0) {
				inserted = await q
					.insert(articles)
					.values(newRows)
					.onConflictDoNothing()
					.returning();
			}

			// Update feed metadata + unread count
			const unreadRows = await q
				.select({ id: articles.id })
				.from(articles)
				.where(and(eq(articles.feedId, id), eq(articles.read, false)));

			// Also update feed title if we got a better one
			const updatedTitle =
				feedData.title && feedData.title !== feed.title
					? feedData.title
					: feed.title;

			await q
				.update(feeds)
				.set({
					title: updatedTitle,
					lastFetched: now,
					unreadCount: unreadRows.length,
					lastUpdatedAt: now,
				})
				.where(eq(feeds.id, id));

			console.log(
				`[refreshFeed] ${id}: ${inserted.length} new articles, ${unreadRows.length} unread`,
			);
			return inserted;
		},

		// ── Article management ───────────────────────────────────────────────────

		listArticles: async (feedId) => {
			if (feedId) {
				return q.select().from(articles).where(eq(articles.feedId, feedId));
			}
			return q.select().from(articles);
		},

		markArticleRead: async (id, read, readAt) => {
			await q
				.update(articles)
				.set({
					read,
					readAt: readAt ?? null,
					lastUpdatedAt: new Date().toISOString(),
				})
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
					.set({ liked: !cur.liked, lastUpdatedAt: new Date().toISOString() })
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
					.set({ saved: !cur.saved, lastUpdatedAt: new Date().toISOString() })
					.where(eq(articles.id, id));
		},

		updateArticleContent: async (id, fullContent) => {
			await q
				.update(articles)
				.set({ fullContent, lastUpdatedAt: new Date().toISOString() })
				.where(eq(articles.id, id));
		},
	};
};

// ─── Article content extraction ───────────────────────────────────────────────

export interface ExtractedContent {
	content: string;
	title?: string;
	author?: string;
	image?: string;
	description?: string;
}

/**
 * Determines if an article needs full content extraction.
 * True when fullContent is absent and content is short/snippet-only.
 */
export function needsFullContent(article: {
	content?: string | null;
	contentSnippet?: string | null;
	fullContent?: string | null;
}): boolean {
	if (article.fullContent) return false;
	const text = (article.content ?? "").replace(/<[^>]*>/g, "").trim();
	return text.length < 500;
}

/**
 * Fetches and extracts the full article content from the source URL.
 * Uses @extractus/article-parser which strips nav/ads/footer automatically.
 */
export async function extractArticleContent(
	url: string,
): Promise<ExtractedContent | null> {
	try {
		const res = await fetchWithProxy(url);
		const html = await res.text();
		const result = await extractArticle(url, {}, html);
		if (!result?.content) return null;
		return {
			content: result.content,
			title: result.title ?? undefined,
			author: result.author ?? undefined,
			image: result.image ?? undefined,
			description: result.description ?? undefined,
		};
	} catch (err) {
		console.warn("[extractArticleContent] Failed:", url, err);
		return null;
	}
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export {
	getInitializedAgents,
	initializeAgents,
	type IAgents,
} from "./platform";
export {
	extractKeywords,
	scoreArticlesByKeywords,
	type ScoredArticle,
} from "./recommendations";