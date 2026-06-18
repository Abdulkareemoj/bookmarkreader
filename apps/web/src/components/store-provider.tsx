import type React from "react";
import { useEffect, useState } from "react";
import type { StoreApi } from "zustand";
import { initializeWebAgents } from "@/lib/db";
import { initializeReaderStore, type ReaderState } from "@/lib/store";

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<unknown>(null);

	type InitializedStore = StoreApi<ReaderState>;

	useEffect(() => {
		async function setup() {
			try {
				const injectedAgents =
					typeof window !== "undefined"
						? (globalThis as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
								.__BOOKMARKREADER_AGENTS__
						: undefined;

				if (injectedAgents) {
					setIsInitialized(true);
					return;
				}

				const agents = await initializeWebAgents();
				const store = initializeReaderStore(
					agents,
				) as unknown as InitializedStore;

				// Override refreshFeed with web-specific implementation
				const originalRefreshFeed = store.getState().refreshFeed;
				store.setState({
					refreshFeed: async (feedId: string) => {
						const { rssAgent } = store.getState();
						const feed = agents.rssAgent.listFeeds
							? (await agents.rssAgent.listFeeds()).find(
									(f: any) => f.id === feedId,
								)
							: null;
						if (!feed) return;

						try {
							const { fetchAndParseFeed } = await import("@packages/utils");
							const result = await fetchAndParseFeed(feed.feedUrl);

							const toStr = (v: any): string => {
								if (!v) return "";
								if (typeof v === "string") return v;
								if (typeof v.$ === "string") return v.$;
								return String(v);
							};
							const parsed = result.entries.map((entry: any) => ({
								feedId,
								title: toStr(entry.title) || "(untitled)",
								link: toStr(entry.link) || toStr(entry.id) || "",
								content: toStr(entry.content) || toStr(entry.description) || "",
								contentSnippet: toStr(entry.description)
									.replace(/<[^>]*>/g, "")
									.slice(0, 500),
								imageUrl:
									(typeof entry.image === "string"
										? entry.image
										: entry.image?.url) ||
									entry.enclosures?.[0]?.url ||
									entry["media:content"]?.["@_url"] ||
									entry["media:thumbnail"]?.["@_url"] ||
									undefined,
								pubDate: entry.published
									? new Date(entry.published).toISOString()
									: new Date().toISOString(),
								read: false,
								liked: false,
								saved: false,
								lastUpdatedAt: new Date().toISOString(),
							}));

							await rssAgent.insertArticles(parsed.filter((p: any) => p.link));

							const feedTitle = result.title || feed.title;
							const allArticles = await rssAgent.listArticles(feedId);
							const unreadCount = allArticles.filter(
								(a: any) => !a.read,
							).length;
							await rssAgent.updateFeedMeta(feedId, {
								title: feedTitle,
								lastFetched: new Date().toISOString(),
								unreadCount,
							});
						} catch (e) {
							console.error(`[refreshFeed] ${feedId} failed:`, e);
						}

						await originalRefreshFeed(feedId);
					},
				});

				await store.getState().loadInitialData();
				setIsInitialized(true);
			} catch (e) {
				console.error("Failed to initialize application:", e);
				setInitError(e);
			}
		}
		setup();
	}, []);

	if (initError) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
				<div className="font-medium text-foreground">
					Failed to initialize application
				</div>
				<div className="text-sm">
					Refresh the page. If this keeps happening, clear site data for this
					origin (IndexedDB) and try again.
				</div>
			</div>
		);
	}

	if (!isInitialized) {
		// Render loading state for web app
		return (
			<div className="flex h-screen items-center justify-center text-gray-500">
				Loading data...
			</div>
		);
	}

	return <>{children}</>;
}
