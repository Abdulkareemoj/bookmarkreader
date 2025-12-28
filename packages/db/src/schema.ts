import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Bookmarks Schema ---

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  favicon: text("favicon"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]).notNull(),
  dateAdded: text("date_added")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  favorite: integer("favorite", { mode: "boolean" }).default(false).notNull(),
  collectionId: text("collection_id").default("inbox").notNull(), // Assuming a default collection
  liked: integer("liked", { mode: "boolean" }).default(false).notNull(),
  saved: integer("saved", { mode: "boolean" }).default(true).notNull(), // Bookmarks are inherently 'saved'
  lastUpdatedAt: text("last_updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// --- RSS Feeds Schema ---

export const feeds = sqliteTable("feeds", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  feedUrl: text("feed_url").unique().notNull(),
  siteUrl: text("site_url"),
  lastFetched: text("last_fetched"),
  // unreadCount is typically calculated, but keeping it for simplicity/mocking if needed
  unreadCount: integer("unread_count").default(0).notNull(),
  lastUpdatedAt: text("last_updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// --- RSS Articles Schema ---

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  feedId: text("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  link: text("link").unique().notNull(),
  contentSnippet: text("content_snippet"),
  content: text("content"),
  pubDate: text("pub_date"),
  read: integer("read", { mode: "boolean" }).default(false).notNull(),
  liked: integer("liked", { mode: "boolean" }).default(false).notNull(),
  saved: integer("saved", { mode: "boolean" }).default(false).notNull(),
  lastUpdatedAt: text("last_updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// --- Export Types for Drizzle ---

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
