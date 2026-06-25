import type {
	ISyncAgent,
	SyncData,
	SyncResult,
	IAuthAgent,
	IBookmarkAgent,
	IRssAgent,
	IHighlightAgent,
} from "@packages/agents";
import * as Drive from "./google-drive";

export function createWebSyncAgent(
	authAgent: IAuthAgent,
	bookmarkAgent: IBookmarkAgent,
	rssAgent: IRssAgent,
	highlightAgent: IHighlightAgent,
): ISyncAgent {
	let pollingTimer: ReturnType<typeof setInterval> | null = null;
	let isSyncing = false;

	async function gatherData(): Promise<SyncData> {
		const [bookmarks, feeds, articles, dbHighlights] = await Promise.all([
			bookmarkAgent.listBookmarks(),
			rssAgent.listFeeds(),
			rssAgent.listArticles(),
			highlightAgent.listHighlights(),
		]);
		const highlightsWithAnnotations = await Promise.all(
			dbHighlights.map(async (h) => {
				const anns = await highlightAgent.listAnnotations(h.id);
				return { ...h, annotations: anns };
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
	}

	const agent: ISyncAgent = {
		startAutoSync: (intervalMs) => {
			if (pollingTimer !== null) clearInterval(pollingTimer);
			pollingTimer = setInterval(async () => {
				if (isSyncing) return;
				isSyncing = true;
				try {
					await agent.sync();
				} catch {
					/* silent */
				} finally {
					isSyncing = false;
				}
			}, intervalMs);
		},

		stopAutoSync: () => {
			if (pollingTimer !== null) {
				clearInterval(pollingTimer);
				pollingTimer = null;
			}
		},

		sync: async () => {
			const startedAt = new Date().toISOString();
			const errors: string[] = [];

			const useDrive = await authAgent.isSignedIn();
			if (!useDrive) {
				return {
					success: false,
					syncedAt: startedAt,
					bookmarksPushed: 0,
					bookmarksPulled: 0,
					feedsPushed: 0,
					feedsPulled: 0,
					articlesPushed: 0,
					articlesPulled: 0,
					errors: ["Not signed in — connect Google Drive in Settings first"],
				};
			}

			try {
				const token = await authAgent.getAccessToken();
				if (!token) {
					return {
						success: false,
						syncedAt: startedAt,
						bookmarksPushed: 0,
						bookmarksPulled: 0,
						feedsPushed: 0,
						feedsPulled: 0,
						articlesPushed: 0,
						articlesPulled: 0,
						errors: ["No access token"],
					};
				}

				const localData = await gatherData();
				const remoteData = await Drive.downloadSyncData(token);

				const pushed = await Drive.uploadSyncData(token, localData);
				if (!pushed) errors.push("Failed to upload to Google Drive");

				if (remoteData) {
					for (const rb of remoteData.bookmarks) {
						const lb = localData.bookmarks.find((b) => b.id === rb.id);
						if (!lb || rb.lastUpdatedAt > lb.lastUpdatedAt) {
							try {
								if (lb) await bookmarkAgent.updateBookmark(rb.id, rb as any);
								else
									await bookmarkAgent.addBookmark({
										title: rb.title,
										url: rb.url,
										description: rb.description,
										favicon: rb.favicon,
										image: rb.image,
										tags: rb.tags,
										favorite: rb.favorite,
										collectionId: rb.collectionId,
									});
							} catch {
								errors.push(`merge bookmark: ${rb.title}`);
							}
						}
					}
					for (const rf of remoteData.feeds) {
						if (!localData.feeds.find((f) => f.id === rf.id)) {
							try {
								await rssAgent.addFeed({
									title: rf.title,
									feedUrl: rf.feedUrl,
									siteUrl: rf.siteUrl,
								});
							} catch {
								errors.push(`merge feed: ${rf.title}`);
							}
						}
					}
					for (const ra of remoteData.articles) {
						if (!localData.articles.find((a) => a.link === ra.link)) {
							try {
								await rssAgent.insertArticles([
									{
										feedId: ra.feedId,
										title: ra.title,
										link: ra.link,
										content: ra.content ?? undefined,
										contentSnippet: ra.contentSnippet ?? undefined,
										imageUrl: ra.imageUrl ?? undefined,
										pubDate: ra.pubDate ?? "",
										read: ra.read,
										liked: ra.liked,
										saved: ra.saved,
										lastUpdatedAt: ra.lastUpdatedAt,
									},
								]);
							} catch {
								errors.push(`merge article: ${ra.title}`);
							}
						}
					}
				}

				return {
					success: errors.length === 0,
					syncedAt: startedAt,
					bookmarksPushed: localData.bookmarks.length,
					bookmarksPulled: remoteData ? remoteData.bookmarks.length : 0,
					feedsPushed: localData.feeds.length,
					feedsPulled: remoteData ? remoteData.feeds.length : 0,
					articlesPushed: localData.articles.length,
					articlesPulled: remoteData ? remoteData.articles.length : 0,
					errors,
				};
			} catch (err) {
				return {
					success: false,
					syncedAt: startedAt,
					bookmarksPushed: 0,
					bookmarksPulled: 0,
					feedsPushed: 0,
					feedsPulled: 0,
					articlesPushed: 0,
					articlesPulled: 0,
					errors: [String(err)],
				};
			}
		},

		exportToFile: async () => {
			throw new Error("Use exportSyncData() from @/lib/sync instead");
		},

		importFromFile: async () => {
			throw new Error("Use importSyncData() from @/lib/sync instead");
		},

		getSyncFilePath: () => null,
	};

	return agent;
}
