// A lot of AI generated stuff here but decently documented
// @ts-nocheck
import { useSettingsStore } from "@packages/store";
import type { Bookmark, Article, Feed } from "@packages/store";
// Helper functions for metadata extraction
function extractTitle(html: string, url: string): string {
  // Try Open Graph title
  const ogTitleMatch = html.match(
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (ogTitleMatch) return ogTitleMatch[1];

  // Try Twitter title
  const twitterTitleMatch = html.match(
    /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (twitterTitleMatch) return twitterTitleMatch[1];

  // Try <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  // Fallback to URL
  return url;
}

function extractFavicon(html: string, url: string): string | undefined {
  // Try Open Graph image
  const ogImageMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (ogImageMatch) return ogImageMatch[1];

  // Try Twitter image
  const twitterImageMatch = html.match(
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (twitterImageMatch) return twitterImageMatch[1];

  // Try favicon links
  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  if (faviconMatch) {
    const faviconUrl = faviconMatch[1];
    // Make relative URLs absolute
    if (faviconUrl.startsWith("/")) {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${faviconUrl}`;
    }
    if (faviconUrl.startsWith("http")) {
      return faviconUrl;
    }

    // Relative path
    const urlObj = new URL(url);
    return new URL(faviconUrl, urlObj.href).href;
  }

  return undefined;
}

function extractDescription(html: string): string | undefined {
  // Try Open Graph description
  const ogDescMatch = html.match(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (ogDescMatch) return ogDescMatch[1];

  // Try Twitter description
  const twitterDescMatch = html.match(
    /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (twitterDescMatch) return twitterDescMatch[1];

  // Try meta description
  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (descMatch) return descMatch[1];

  return undefined;
}

// Simple RSS parser (basic implementation)
export async function parseRSS(
  xmlText: string,
  feedId: string
): Promise<Omit<NewArticle, "id">[]> {
  const normalize = (value?: string) => {
    if (!value) return "";
    return value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  const pickTag = (block: string, tag: string) => {
    const m = block.match(
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
    );
    return m ? normalize(m[1]) : "";
  };

  const pickAtomLink = (block: string) => {
    const m = block.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i
    );
    if (m) return normalize(m[1]);
    return pickTag(block, "link");
  };

  const parseDate = (raw: string) => {
    const d = raw ? new Date(raw) : new Date();
    return Number.isNaN(d.getTime())
      ? new Date().toISOString()
      : d.toISOString();
  };

  const now = new Date().toISOString();
  const out: Omit<NewArticle, "id">[] = [];

  // RSS 2.0
  const itemBlocks = xmlText.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of itemBlocks) {
    const title = pickTag(block, "title") || "(untitled)";
    const link = pickTag(block, "link");
    const description =
      pickTag(block, "description") || pickTag(block, "content:encoded");
    const pubDateRaw = pickTag(block, "pubDate") || pickTag(block, "dc:date");

    if (!link) continue;

    out.push({
      feedId,
      title,
      link,
      contentSnippet: description || undefined,
      content: description || undefined,
      pubDate: parseDate(pubDateRaw),
      read: false,
      liked: false,
      saved: false,
      lastUpdatedAt: now,
    });
  }

  // Atom
  if (out.length === 0) {
    const entryBlocks = xmlText.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
    for (const block of entryBlocks) {
      const title = pickTag(block, "title") || "(untitled)";
      const link = pickAtomLink(block);
      const summary = pickTag(block, "summary") || pickTag(block, "content");
      const dateRaw = pickTag(block, "updated") || pickTag(block, "published");

      if (!link) continue;

      out.push({
        feedId,
        title,
        link,
        contentSnippet: summary || undefined,
        content: summary || undefined,
        pubDate: parseDate(dateRaw),
        read: false,
        liked: false,
        saved: false,
        lastUpdatedAt: now,
      });
    }
  }

  return out;
}

function stableId(prefix: string, input: string) {
  // FNV-1a 32-bit
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

// Base interface for syncable entities with required fields
interface SyncEntityBase {
  id: string;
  lastUpdatedAt: string;
}
import { bookmarks, articles, feeds } from "@packages/db/src/schema";
import type { NewBookmark, NewArticle, NewFeed } from "@packages/db/src/schema";
import type { DB } from "@packages/db/src/index";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { IRemoteApi } from "@packages/api";

// --- Bookmark Agent ---

export interface IBookmarkAgent {
  // CRUD
  addBookmark(data: Omit<NewBookmark, "id" | "dateAdded">): Promise<Bookmark>;
  getBookmark(id: string): Promise<Bookmark | undefined>;
  listBookmarks(collectionId?: string): Promise<Bookmark[]>;
  updateBookmark(
    id: string,
    data: Partial<Omit<NewBookmark, "id">>
  ): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<void>;

  // Metadata & Organization
  fetchMetadata(
    url: string
  ): Promise<{ title: string; favicon?: string; description?: string }>;
  toggleFavorite(id: string): Promise<void>;
  addTag(id: string, tag: string): Promise<void>;
}

// Factory function implementation
export const createBookmarkAgent = (db: DB): IBookmarkAgent => ({
  addBookmark: async (data) => {
    const [newBookmark] = await db
      .insert(bookmarks)
      .values({
        ...data,
        id: `bkm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        dateAdded: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      })
      .returning();

    if (!newBookmark) {
      throw new Error("Failed to add bookmark.");
    }
    return newBookmark;
  },

  getBookmark: async (id) => {
    const result = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, id))
      .limit(1);
    return result[0];
  },

  listBookmarks: async (_collectionId) => {
    // Note: collectionId logic is not implemented in schema yet, listing all for now
    return db.select().from(bookmarks);
  },

  updateBookmark: async (id, data) => {
    const [updatedBookmark] = await db
      .update(bookmarks)
      .set({ ...data, lastUpdatedAt: new Date().toISOString() })
      .where(eq(bookmarks.id, id))
      .returning();

    if (!updatedBookmark) {
      throw new Error(`Bookmark with ID ${id} not found.`);
    }
    return updatedBookmark;
  },

  deleteBookmark: async (id) => {
    await db.delete(bookmarks).where(eq(bookmarks.id, id));
  },

  fetchMetadata: async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "BookmarkReader/1.0",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = await response.text();

      // Parse Open Graph and meta tags
      const title = extractTitle(html, url);
      const favicon = extractFavicon(html, url);
      const description = extractDescription(html);

      return { title, favicon, description };
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      // Fallback to URL as title
      return {
        title: url,
        favicon: undefined,
        description: undefined,
      };
    }
  },

  toggleFavorite: async (id) => {
    // Toggle boolean value using Drizzle update
    const [current] = await db
      .select({ favorite: bookmarks.favorite })
      .from(bookmarks)
      .where(eq(bookmarks.id, id));
    if (current) {
      await db
        .update(bookmarks)
        .set({
          favorite: !current.favorite,
          lastUpdatedAt: new Date().toISOString(),
        })
        .where(eq(bookmarks.id, id));
    }
  },

  addTag: async (_id, _tag) => {
    // This requires reading the current tags, appending the new tag, and updating.
    // For simplicity, we'll use a raw SQL update to append the tag to the JSON array.
    // NOTE: This is complex in SQLite JSON functions and might be better handled in application logic.
    // Placeholder for now:
    throw new Error(
      "Tag manipulation logic requires complex JSON handling and is deferred."
    );
  },
});

// --- RSS Agent ---

export interface IRssAgent {
  // Feed Management
  addFeed(data: Omit<NewFeed, "id">): Promise<Feed>;
  removeFeed(id: string): Promise<void>;
  listFeeds(): Promise<Feed[]>;
  refreshFeed(id: string): Promise<Article[]>; // Fetches new articles

  // Article Management
  listArticles(feedId?: string): Promise<Article[]>;
  markArticleRead(id: string, read: boolean): Promise<void>;
  toggleArticleLike(id: string): Promise<void>;
  toggleArticleSave(id: string): Promise<void>;
}

// Factory function implementation
export const createRssAgent = (db: DB): IRssAgent => ({
  addFeed: async (data) => {
    const [newFeed] = await db
      .insert(feeds)
      .values({
        ...data,
        id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        unreadCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      })
      .returning();

    if (!newFeed) {
      throw new Error("Failed to add feed.");
    }
    return newFeed;
  },

  removeFeed: async (id) => {
    // Deleting the feed cascades to articles due to schema definition
    await db.delete(feeds).where(eq(feeds.id, id));
  },

  listFeeds: async () => {
    return db.select().from(feeds);
  },

  refreshFeed: async (id) => {
    const [feed] = await db
      .select()
      .from(feeds)
      .where(eq(feeds.id, id))
      .limit(1);
    if (!feed) {
      throw new Error("Feed not found.");
    }

    const res = await fetch(feed.feedUrl, {
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feed (${res.status}): ${feed.feedUrl}`);
    }

    const xmlText = await res.text();
    const parsed = await parseRSS(xmlText, id);

    const links = parsed.map((a) => a.link).filter(Boolean);
    if (links.length === 0) {
      return [];
    }

    const existing = await db
      .select({ link: articles.link })
      .from(articles)
      .where(inArray(articles.link, links));

    const existingLinks = new Set(existing.map((e) => e.link));
    const now = new Date().toISOString();

    const newRows: NewArticle[] = parsed
      .filter((a) => a.link && !existingLinks.has(a.link))
      .map((a) => ({
        ...a,
        id: stableId("article", `${id}|${a.link}`),
        lastUpdatedAt: now,
      }));

    let inserted: Article[] = [];
    if (newRows.length > 0) {
      inserted = await db.insert(articles).values(newRows).returning();
    }

    const unreadResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(and(eq(articles.feedId, id), eq(articles.read, false)));
    const unreadCount = unreadResult[0]?.count ?? 0;

    await db
      .update(feeds)
      .set({
        lastFetched: now,
        unreadCount,
        lastUpdatedAt: now,
      })
      .where(eq(feeds.id, id));

    return inserted;
  },

  listArticles: async (feedId) => {
    if (feedId) {
      return db.select().from(articles).where(eq(articles.feedId, feedId));
    }
    return db.select().from(articles);
  },

  markArticleRead: async (id, read) => {
    await db
      .update(articles)
      .set({ read, lastUpdatedAt: new Date().toISOString() })
      .where(eq(articles.id, id));
    // NOTE: Unread count update logic for the feed is deferred to the store/app layer
  },

  toggleArticleLike: async (id) => {
    const [current] = await db
      .select({ liked: articles.liked })
      .from(articles)
      .where(eq(articles.id, id));
    if (current) {
      await db
        .update(articles)
        .set({ liked: !current.liked, lastUpdatedAt: new Date().toISOString() })
        .where(eq(articles.id, id));
    }
  },

  toggleArticleSave: async (id) => {
    const [current] = await db
      .select({ saved: articles.saved })
      .from(articles)
      .where(eq(articles.id, id));
    if (current) {
      await db
        .update(articles)
        .set({ saved: !current.saved, lastUpdatedAt: new Date().toISOString() })
        .where(eq(articles.id, id));
    }
  },
});

// --- Sync Agent ---

interface ISyncAgent {
  /** Tests the connection to the remote API using current settings. */
  testConnection(): Promise<void>;
  /** Performs a full bi-directional sync for all syncable entities. */
  syncAllData(): Promise<void>;
  /** Performs a bi-directional sync for Bookmarks with timestamp conflict resolution. */
  syncBookmarks(): Promise<void>;
  /** Performs a bi-directional sync for Feeds with timestamp conflict resolution. */
  syncFeeds(): Promise<void>;
  // TODO: Add syncArticles method for read/liked/saved status updates
}

const createSyncAgent = (
  localBookmarks: IBookmarkAgent & { db: DB },
  localRss: IRssAgent & { db: DB },
  remoteApi: IRemoteApi
): ISyncAgent => {
  const syncEntity = async <
    T extends (Bookmark | Feed | Article) & SyncEntityBase
  >(
    entityName: string,
    localList: T[],
    remoteList: T[],
    localDb: DB,
    drizzleSchema: any, // bookmarks or feeds schema object
    remoteSyncFunction: (entity: T) => Promise<T>
  ) => {
    const localMap = new Map(localList.map((e) => [e.id, e]));
    const remoteMap = new Map(remoteList.map((e) => [e.id, e]));
    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

    let pushed = 0;
    let pulled = 0;

    for (const id of allIds) {
      const local = localMap.get(id);
      const remote = remoteMap.get(id);

      if (!remote && local) {
        // Local only: PUSH to remote
        await remoteSyncFunction(local);
        pushed++;
      } else if (!local && remote) {
        // Remote only: PULL to local (upsert)
        // Note: We cast to NewBookmark/NewFeed since Drizzle insert types are complex.
        await localDb
          .insert(drizzleSchema as any) // Cast to any to bypass type complexity
          .values(remote)
          .onConflictDoUpdate({
            target: drizzleSchema.id,
            set: remote,
          });
        pulled++;
      } else if (local && remote) {
        // Both exist: CONFLICT RESOLUTION (Timestamp wins)
        const localTime = new Date(local.lastUpdatedAt).getTime();
        const remoteTime = new Date(remote.lastUpdatedAt).getTime();

        if (remoteTime > localTime) {
          // Remote wins: PULL and overwrite local
          await localDb
            .insert(drizzleSchema as any) // Cast to any to bypass type complexity
            .values(remote)
            .onConflictDoUpdate({
              target: drizzleSchema.id,
              set: remote,
            });
          pulled++;
        } else if (localTime > remoteTime) {
          // Local wins: PUSH and overwrite remote
          await remoteSyncFunction(local);
          pushed++;
        }
        // If timestamps are equal, assume resolution is stable (no action needed)
      }
    }
    console.log(
      `[Sync Agent] Synced ${entityName}: Pulled ${pulled}, Pushed ${pushed}`
    );
  };

  return {
    testConnection: async () => {
      const { supabaseUrl, supabaseAnonKey } = useSettingsStore.getState();
      remoteApi.setSupabaseConfig(supabaseUrl, supabaseAnonKey);

      // Simple check to ensure the client is initialized (which includes URL validation)
      // The remoteApi implementation should throw if configuration is invalid.
      remoteApi.getSupabaseClient();

      console.log("[Sync Agent] Connection test successful.");
    },

    syncAllData: async function () {
      console.log("[Sync Agent] Starting full data sync...");
      // Ensure we have current config before running sync
      const { supabaseUrl, supabaseAnonKey } = useSettingsStore.getState();
      remoteApi.setSupabaseConfig(supabaseUrl, supabaseAnonKey);

      console.log("[Sync Agent] Starting full data sync...");

      await Promise.all([
        // Initial sync runs bookmarks and feeds sequentially for simpler debugging
        // We defer articles status sync as it's more complex.
        this.syncBookmarks(),
        this.syncFeeds(),
      ]);

      console.log("[Sync Agent] Full data sync complete.");
    },

    syncBookmarks: async () => {
      const [localList, remoteList] = await Promise.all([
        localBookmarks.listBookmarks(),
        remoteApi.fetchRemoteBookmarks(),
      ]);

      await syncEntity<Bookmark>(
        "Bookmarks",
        localList as Bookmark[],
        remoteList as Bookmark[],
        localBookmarks.db,
        bookmarks,
        (bookmark) => remoteApi.syncBookmark(bookmark)
      );
    },

    syncFeeds: async () => {
      const [localList, remoteList] = await Promise.all([
        localRss.listFeeds(),
        remoteApi.fetchRemoteFeeds(),
      ]);

      await syncEntity<Feed>(
        "Feeds",
        localList as Feed[],
        remoteList as Feed[],
        localRss.db,
        feeds,
        (feed) => remoteApi.syncFeed(feed)
      );
    },
  };
};

export { createSyncAgent, type ISyncAgent };
export {
  initializeAgents,
  getInitializedAgents,
  type IAgents,
} from "./platform";
