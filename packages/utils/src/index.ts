// Web/desktop utilities — uses extractus packages for feed/article parsing, which aren't mobile-safe due to CORS and size issues. Mobile uses custom implementations in mobile.ts.
// Mobile uses apps/mobile/lib/rss.ts instead

import { extractFromXml, extractFromJson } from "@extractus/feed-extractor";
import { extract as extractArticle } from "@extractus/article-extractor";

// Re-export everything from agents so existing imports keep working
export {
	createBookmarkAgent,
	createRssAgent,
	createHighlightAgent,
	type IBookmarkAgent,
	type IRssAgent,
	type IHighlightAgent,
	type ISyncAgent,
	type IAuthAgent,
	type IAgents,
	type Bookmark,
	type Feed,
	type Article,
	type ParsedArticle,
	type SyncData,
	type SyncResult,
	type SyncProvider,
	type AuthProvider,
	type AuthResult,
	type AuthUserInfo,
} from "@packages/agents";

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
	try {
		const res = await fetch(url, options);
		if (res.ok) return res;
	} catch {
		// fall through to proxies
	}

	let lastError: Error | null = null;
	let firstResponse: Response | null = null;
	for (const proxy of CORS_PROXIES) {
		try {
			const res = await fetch(proxy + encodeURIComponent(url), {
				...options,
				mode: "cors",
			});
			if (res.ok) return res;
			// Keep the first response (even non-ok) so we can show meaningful error messages
			if (!firstResponse) firstResponse = res;
		} catch (e) {
			lastError = e as Error;
			await new Promise((r) => setTimeout(r, 300));
		}
	}

	// Return the first proxy's response if we got one, so fetchAndParseFeed
	// can report the actual HTTP status (e.g. 404 from YouTube)
	if (firstResponse) return firstResponse;

	throw lastError ?? new Error(`Failed to fetch: ${url}`);
}

// ─── Web RSS feed fetching (uses extractus) ───────────────────────────────────

/**
 * Fetch and parse a feed URL for web/desktop.
 * Uses @extractus/feed-extractor via pre-fetched content to avoid CORS issues.
 */
export async function fetchAndParseFeed(
	feedUrl: string,
): Promise<{ title?: string; entries: any[] }> {
	const res = await fetchWithProxy(feedUrl, {
		headers: {
			Accept:
				"application/rss+xml, application/atom+xml, application/json, application/xml, text/xml;q=0.9, */*;q=0.8",
		},
	});
	const rawText = await res.text();

	if (!res.ok) {
		throw new Error(
			`Feed returned HTTP ${res.status}. Check that the URL is correct.`,
		);
	}

	const trimmed = rawText.trimStart();

	if (trimmed.startsWith("{")) {
		// JSON Feed
		const feedData = extractFromJson(rawText, {
			getExtraEntryFields: (entry: any) => ({
				content: entry.content_html ?? entry.content_text ?? "",
				enclosures: entry.attachments ?? [],
			}),
		});
		return {
			title: feedData?.title,
			entries: feedData?.entries ?? [],
		};
	}

	if (
		!trimmed.startsWith("<?xml") &&
		!trimmed.startsWith("<rss") &&
		!trimmed.startsWith("<feed")
	) {
		// Not XML — might be an HTML error page from the feed source
		const snippet = trimmed.slice(0, 200).replace(/\s+/g, " ").trim();
		throw new Error(
			`Feed returned non-XML content (starts with "${snippet.slice(0, 60)}". The feed URL may not exist or the source requires a different URL format.`,
		);
	}

	const grabMediaThumb = (entry: any): any => {
		return (
			entry["media:thumbnail"] ?? entry["media:group"]?.["media:thumbnail"] ?? undefined
		);
	};
	const grabMediaContent = (entry: any): any => {
		return (
			entry["media:content"] ?? entry["media:group"]?.["media:content"] ?? undefined
		);
	};
	const xmlStr = (v: any): string => {
		if (!v) return "";
		if (typeof v === "string") return v;
		if (typeof v.$ === "string") return v.$;
		return String(v);
	};
	const feedData = extractFromXml(rawText, {
		getExtraEntryFields: (entry: any) => {
			const mediaGroup = entry["media:group"];
			return {
				content:
					xmlStr(entry["content:encoded"]) ||
					xmlStr(entry.content) ||
					xmlStr(entry.description) ||
					xmlStr(mediaGroup?.["media:description"]) ||
					"",
				enclosures: entry.enclosure ? [entry.enclosure] : [],
				"media:content": grabMediaContent(entry),
				"media:thumbnail": grabMediaThumb(entry),
			};
		},
	});

	return {
		title: feedData?.title,
		entries: feedData?.entries ?? [],
	};
}

// ─── Article content extraction (web/desktop) ─────────────────────────────────

export interface ExtractedContent {
	content: string;
	title?: string;
	author?: string;
	image?: string;
	description?: string;
}

export function needsFullContent(article: {
	content?: string | null;
	contentSnippet?: string | null;
	fullContent?: string | null;
}): boolean {
	if (article.fullContent) return false;
	const text = (article.content ?? "").replace(/<[^>]*>/g, "").trim();
	return text.length < 500;
}

export async function extractArticleContent(
	url: string,
): Promise<ExtractedContent | null> {
	try {
		const res = await fetchWithProxy(url);
		const html = await res.text();

		// Patch global fetch so article-parser doesn't make its own CORS-blocked request
		const originalFetch = globalThis.fetch;
		globalThis.fetch = () =>
			Promise.resolve(new Response(html, { status: 200 }));
		let result: any;
		try {
			result = await extractArticle(url, {}, html as any);
		} finally {
			globalThis.fetch = originalFetch;
		}

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
	extractKeywords,
	scoreArticlesByKeywords,
	type ScoredArticle,
} from "./recommendations";

export {
	parseOpml,
	extractFeedsFromOpml,
	extractBookmarksFromOpml,
	generateOpml,
	type OpmlDocument,
	type OpmlOutline,
} from "./opml";

export {
	parseHtmlBookmarks,
	generateHtmlBookmarks,
	type HtmlBookmarkEntry,
} from "./html-bookmarks";

export { detectFormat, type ExportFormat, type DetectedFormat } from "./formats";

export {
	curatedFeedsByCategory,
	getAllCuratedFeeds,
	getRandomFeeds,
	getCategories,
	type CuratedFeed,
} from "./feed-directory";

export {
	discoverYouTubeChannelFeed,
	parseYouTubeChannelUrl,
	resolveYouTubeHandle,
	extractYouTubeHandle,
	type YouTubeChannelResult,
} from "./youtube";
