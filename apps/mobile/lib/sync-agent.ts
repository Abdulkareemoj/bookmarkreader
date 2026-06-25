import type {
	IAuthAgent,
	IBookmarkAgent,
	IRssAgent,
	IHighlightAgent,
	ISyncAgent,
	SyncData,
	SyncResult,
} from "@packages/agents";
import { uploadSyncData, downloadSyncData } from "./google-drive";

/**
 * Creates a mobile sync agent.
 * When authenticated with a cloud provider (e.g. Google Drive),
 * sync reads/writes the sync file via the cloud API.
 * Falls back to a stub if not authenticated.
 */
export function createMobileSyncAgent(
	authAgent: IAuthAgent,
	bookmarkAgent: IBookmarkAgent,
	rssAgent: IRssAgent,
	highlightAgent: IHighlightAgent,
): ISyncAgent {
	const pushLocalData = async (): Promise<SyncData> => {
		const [bookmarks, feeds, articles, dbHighlights] = await Promise.all([
			bookmarkAgent.listBookmarks(),
			rssAgent.listFeeds(),
			rssAgent.listArticles(),
			highlightAgent.listHighlights(),
		]);

		const highlightsWithAnnotations = await Promise.all(
			dbHighlights.map(async (h) => {
				const annotations = await highlightAgent.listAnnotations(h.id);
				return { ...h, annotations };
			}),
		);

		return {
			version: 1,
			exportedAt: new Date().toISOString(),
			bookmarks,
			feeds,
			articles,
			highlights: highlightsWithAnnotations,
		};
	};

	const mergeData = async (
		localData: SyncData,
		remoteData: SyncData,
	): Promise<SyncData> => {
		// Merge by lastUpdatedAt — newer wins
		const bookmarkMap = new Map(
			localData.bookmarks.map((b) => [b.id, b]),
		);
		for (const rb of remoteData.bookmarks) {
			const existing = bookmarkMap.get(rb.id);
			if (
				!existing ||
				new Date(rb.lastUpdatedAt) > new Date(existing.lastUpdatedAt)
			) {
				bookmarkMap.set(rb.id, rb);
			}
		}

		const feedMap = new Map(localData.feeds.map((f) => [f.id, f]));
		for (const rf of remoteData.feeds) {
			const existing = feedMap.get(rf.id);
			if (
				!existing ||
				new Date(rf.lastUpdatedAt) > new Date(existing.lastUpdatedAt)
			) {
				feedMap.set(rf.id, rf);
			}
		}

		const articleMap = new Map(
			localData.articles.map((a) => [a.id, a]),
		);
		for (const ra of remoteData.articles) {
			const existing = articleMap.get(ra.id);
			if (
				!existing ||
				new Date(ra.lastUpdatedAt) > new Date(existing.lastUpdatedAt)
			) {
				articleMap.set(ra.id, ra);
			}
		}

		return {
			version: 1,
			exportedAt: new Date().toISOString(),
			bookmarks: Array.from(bookmarkMap.values()),
			feeds: Array.from(feedMap.values()),
			articles: Array.from(articleMap.values()),
			highlights: localData.highlights,
		};
	};

	return {
		startAutoSync: () => {},
		stopAutoSync: () => {},

		sync: async (): Promise<SyncResult> => {
			const syncedAt = new Date().toISOString();
			const errors: string[] = [];

			const authenticated = await authAgent.isSignedIn();
			if (!authenticated) {
				return {
					success: false,
					syncedAt,
					bookmarksPushed: 0,
					bookmarksPulled: 0,
					feedsPushed: 0,
					feedsPulled: 0,
					articlesPushed: 0,
					articlesPulled: 0,
					errors: [
						"Not signed in. Go to Settings → Sync to connect a cloud provider.",
					],
				};
			}

			try {
				const localData = await pushLocalData();

				// Try to download remote data
				const remoteData = await downloadSyncData(authAgent);

				let mergedData: SyncData;

				if (remoteData) {
					mergedData = await mergeData(localData, remoteData);
				} else {
					mergedData = localData;
				}

				const pushed = await uploadSyncData(authAgent, mergedData);
				if (!pushed) {
					errors.push("Failed to upload sync data");
				}

				return {
					success: errors.length === 0,
					syncedAt,
					bookmarksPushed: localData.bookmarks.length,
					bookmarksPulled: remoteData?.bookmarks.length ?? 0,
					feedsPushed: localData.feeds.length,
					feedsPulled: remoteData?.feeds.length ?? 0,
					articlesPushed: localData.articles.length,
					articlesPulled: remoteData?.articles.length ?? 0,
					errors,
				};
			} catch (e) {
				errors.push(`Sync failed: ${(e as Error).message}`);
				return {
					success: false,
					syncedAt,
					bookmarksPushed: 0,
					bookmarksPulled: 0,
					feedsPushed: 0,
					feedsPulled: 0,
					articlesPushed: 0,
					articlesPulled: 0,
					errors,
				};
			}
		},

		exportToFile: async () => {
			throw new Error("Use mobile export in Settings instead");
		},

		importFromFile: async () => {
			throw new Error("Use mobile import in Settings instead");
		},

		getSyncFilePath: () => null,
	};
}
