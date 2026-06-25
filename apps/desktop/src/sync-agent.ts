import { appDataDir } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
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

const SYNC_FILE = "sync.json";

export function createDesktopSyncAgent(
	authAgent: IAuthAgent,
	bookmarkAgent: IBookmarkAgent,
	rssAgent: IRssAgent,
	highlightAgent: IHighlightAgent,
): ISyncAgent {
	let syncFilePath = "";
	let pollingTimer: ReturnType<typeof setInterval> | null = null;
	let isSyncing = false;

	async function ensurePath(): Promise<string> {
		if (syncFilePath) return syncFilePath;
		const dir = await appDataDir();
		syncFilePath = `${dir}/${SYNC_FILE}`;
		return syncFilePath;
	}

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

	async function applyData(data: SyncData): Promise<string[]> {
		const errors: string[] = [];
		for (const bm of data.bookmarks) {
			try {
				await bookmarkAgent.addBookmark({
					title: bm.title,
					url: bm.url,
					description: bm.description,
					favicon: bm.favicon,
					image: bm.image,
					tags: bm.tags,
					favorite: bm.favorite,
					collectionId: bm.collectionId,
				});
			} catch {
				errors.push(`bookmark: ${bm.title}`);
			}
		}
		for (const f of data.feeds) {
			try {
				await rssAgent.addFeed({
					title: f.title,
					feedUrl: f.feedUrl,
					siteUrl: f.siteUrl,
				});
			} catch {
				errors.push(`feed: ${f.title}`);
			}
		}
		for (const a of data.articles) {
			try {
				await rssAgent.insertArticles([
					{
						feedId: a.feedId,
						title: a.title,
						link: a.link,
						content: a.content ?? undefined,
						contentSnippet: a.contentSnippet ?? undefined,
						imageUrl: a.imageUrl ?? undefined,
						pubDate: a.pubDate ?? "",
						read: a.read,
						liked: a.liked,
						saved: a.saved,
						lastUpdatedAt: a.lastUpdatedAt,
					},
				]);
			} catch {
				errors.push(`article: ${a.title}`);
			}
		}
		for (const h of data.highlights) {
			try {
				await highlightAgent.addHighlight({
					articleId: h.articleId,
					text: h.text,
					color: h.color,
					id: h.id,
				});
				for (const ann of h.annotations)
					await highlightAgent.addAnnotation({
						highlightId: h.id,
						text: ann.text,
						id: ann.id,
					});
			} catch {
				errors.push(`highlight: ${h.text.slice(0, 20)}`);
			}
		}
		return errors;
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

			try {
				const localData = await gatherData();
				let remoteData: SyncData | null = null;

				if (useDrive) {
					// Cloud sync via Google Drive
					remoteData = await Drive.downloadSyncData(authAgent);
					const pushed = await Drive.uploadSyncData(authAgent, localData);
					if (!pushed) errors.push("Failed to upload to Google Drive");

					// Merge remote into local if remote exists
					if (remoteData) {
						for (const rb of remoteData.bookmarks) {
							const lb = localData.bookmarks.find((b) => b.id === rb.id);
							if (!lb || rb.lastUpdatedAt > lb.lastUpdatedAt) {
								try {
									if (lb) await bookmarkAgent.updateBookmark(rb.id, rb);
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
					}
				} else {
					// Local file sync (existing behavior)
					const filePath = await ensurePath();
					try {
						remoteData = JSON.parse(await readTextFile(filePath));
					} catch {
						/* first sync */
					}
					await writeTextFile(filePath, JSON.stringify(localData, null, 2));
				}

				// If remote exists, merge by lastUpdatedAt
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
			const data = await gatherData();
			const path = await ensurePath();
			await writeTextFile(path, JSON.stringify(data, null, 2));
			return path;
		},

		importFromFile: async (data, mode) => {
			if (mode === "replace") {
				for (const bm of await bookmarkAgent.listBookmarks())
					await bookmarkAgent.deleteBookmark(bm.id);
				for (const f of await rssAgent.listFeeds())
					await rssAgent.removeFeed(f.id);
			}
			const errors = await applyData(data);
			if (errors.length) throw new Error(`Import errors: ${errors.join(", ")}`);
		},

		getSyncFilePath: () => syncFilePath || null,
	};

	return agent;
}
