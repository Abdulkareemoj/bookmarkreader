import { getInitializedAgents } from "./agents";

export interface SyncData {
	version: number;
	exportedAt: string;
	bookmarks: any[];
	feeds: any[];
	articles: any[];
}

export async function exportSyncData(): Promise<SyncData> {
	const agents = getInitializedAgents();
	const [bookmarks, feeds, articles] = await Promise.all([
		agents.bookmarkAgent.listBookmarks(),
		agents.rssAgent.listFeeds(),
		agents.rssAgent.listArticles(),
	]);

	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		bookmarks,
		feeds,
		articles,
	};
}

export async function importSyncData(
	data: SyncData,
	mode: "merge" | "replace" = "merge",
): Promise<void> {
	const agents = getInitializedAgents();

	if (mode === "replace") {
		// Delete all existing data first
		for (const bookmark of await agents.bookmarkAgent.listBookmarks()) {
			await agents.bookmarkAgent.deleteBookmark(bookmark.id);
		}
		for (const feed of await agents.rssAgent.listFeeds()) {
			await agents.rssAgent.removeFeed(feed.id);
		}
	}

	// Import bookmarks
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
		} catch (e) {
			// Already exists, skip
		}
	}

	// Import feeds (without articles, we'll fetch fresh)
	for (const feed of data.feeds) {
		try {
			await agents.rssAgent.addFeed({
				title: feed.title,
				feedUrl: feed.feedUrl,
				siteUrl: feed.siteUrl,
			});
		} catch (e) {
			// Already exists, skip
		}
	}
}
