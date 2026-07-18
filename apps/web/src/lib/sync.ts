import type { ExportFormat, DetectedFormat } from "@packages/utils";
import { detectFormat } from "@packages/utils";
import { getInitializedAgents } from "./agents";

export type { ExportFormat, DetectedFormat };
export { detectFormat };

export interface SyncData {
	version: number;
	exportedAt: string;
	bookmarks: any[];
	feeds: any[];
	articles: any[];
}

export async function exportSyncData(format: ExportFormat = "json"): Promise<{
	data: string;
	ext: string;
	mime: string;
	filename: string;
}> {
	const agents = getInitializedAgents();
	const [bookmarks, feeds, articles] = await Promise.all([
		agents.bookmarkAgent.listBookmarks(),
		agents.rssAgent.listFeeds(),
		agents.rssAgent.listArticles(),
	]);

	const dateStr = new Date().toISOString().split("T")[0];

	switch (format) {
		case "json": {
			const syncData: SyncData = {
				version: 1,
				exportedAt: new Date().toISOString(),
				bookmarks,
				feeds,
				articles,
			};
			return {
				data: JSON.stringify(syncData, null, 2),
				ext: "json",
				mime: "application/json",
				filename: `readrsync-${dateStr}.json`,
			};
		}

		case "opml": {
			const { generateOpml } = await import("@packages/utils");
			const opml = generateOpml({
				title: "ReadrSync Export",
				feeds: feeds.map((f: any) => ({
					title: f.title,
					feedUrl: f.feedUrl,
					siteUrl: f.siteUrl,
				})),
				bookmarks: bookmarks.map((b: any) => ({
					title: b.title,
					url: b.url,
					description: b.description,
				})),
			});
			return {
				data: opml,
				ext: "opml",
				mime: "application/xml",
				filename: `readrsync-${dateStr}.opml`,
			};
		}

		case "html": {
			const { generateHtmlBookmarks } = await import("@packages/utils");
			const html = generateHtmlBookmarks({
				title: "ReadrSync Bookmarks",
				bookmarks: bookmarks.map((b: any) => ({
					title: b.title,
					url: b.url,
					tags: b.tags,
					description: b.description,
					icon: b.favicon,
				})),
			});
			return {
				data: html,
				ext: "html",
				mime: "text/html",
				filename: `readrsync-${dateStr}.html`,
			};
		}
	}
}

export async function importSyncData(
	content: string,
	format: DetectedFormat,
	mode: "merge" | "replace" = "merge",
): Promise<void> {
	const agents = getInitializedAgents();

	switch (format) {
		case "json": {
			const data: SyncData = JSON.parse(content);
			if (mode === "replace") {
				for (const bookmark of await agents.bookmarkAgent.listBookmarks()) {
					await agents.bookmarkAgent.deleteBookmark(bookmark.id);
				}
				for (const feed of await agents.rssAgent.listFeeds()) {
					await agents.rssAgent.removeFeed(feed.id);
				}
			}
			for (const bookmark of data.bookmarks) {
				try {
					await agents.bookmarkAgent.addBookmark({
						title: bookmark.title,
						url: bookmark.url,
						description: bookmark.description,
						favicon: bookmark.favicon,
						tags: bookmark.tags,
						favorite: bookmark.favorite,
						collectionId: bookmark.collectionId,
					});
				} catch {}
			}
			for (const feed of data.feeds) {
				try {
					await agents.rssAgent.addFeed({
						title: feed.title,
						feedUrl: feed.feedUrl,
						siteUrl: feed.siteUrl,
					});
				} catch {}
			}
			break;
		}

		case "opml": {
			const { parseOpml, extractFeedsFromOpml, extractBookmarksFromOpml } =
				await import("@packages/utils");
			const opml = parseOpml(content);
			const feeds = extractFeedsFromOpml(opml);
			const bookmarks = extractBookmarksFromOpml(opml);
			if (mode === "replace") {
				for (const b of await agents.bookmarkAgent.listBookmarks()) {
					await agents.bookmarkAgent.deleteBookmark(b.id);
				}
				for (const f of await agents.rssAgent.listFeeds()) {
					await agents.rssAgent.removeFeed(f.id);
				}
			}
			for (const bm of bookmarks) {
				try {
					await agents.bookmarkAgent.addBookmark({
						title: bm.title,
						url: bm.url,
						description: bm.description,
						tags: bm.tags ?? [],
						collectionId: "inbox",
					});
				} catch {}
			}
			for (const feed of feeds) {
				try {
					await agents.rssAgent.addFeed(feed);
				} catch {}
			}
			break;
		}

		case "html": {
			const { parseHtmlBookmarks } = await import("@packages/utils");
			const entries = parseHtmlBookmarks(content);
			if (mode === "replace") {
				for (const b of await agents.bookmarkAgent.listBookmarks()) {
					await agents.bookmarkAgent.deleteBookmark(b.id);
				}
			}
			for (const entry of entries) {
				try {
					await agents.bookmarkAgent.addBookmark({
						title: entry.title,
						url: entry.url,
						tags: entry.tags ?? [],
						description: entry.description,
						favicon: entry.icon,
						collectionId: "inbox",
					});
				} catch {}
			}
			break;
		}
	}
}
