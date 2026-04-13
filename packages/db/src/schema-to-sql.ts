/**
 * Utility to generate CREATE TABLE SQL from Drizzle schema
 * This allows us to initialize the web/mobile database without filesystem access
 * The schema source is in packages/db/src/schema.ts
 */

//need to find a way to keep track of this 

export const SCHEMA_VERSION = 1;

/**
 * Gets the CREATE TABLE statements needed to initialize the database
 * Must match packages/db/src/schema.ts exactly
 */
export function getCreateTableStatements(): string[] {
	return [
		// Schema version tracking table
		`CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Bookmarks table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      favicon TEXT,
      tags TEXT DEFAULT '[]' NOT NULL,
      date_added TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      favorite INTEGER DEFAULT 0 NOT NULL,
      collection_id TEXT DEFAULT 'inbox' NOT NULL,
      liked INTEGER DEFAULT 0 NOT NULL,
      saved INTEGER DEFAULT 1 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Feeds table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      feed_url TEXT UNIQUE NOT NULL,
      site_url TEXT,
      last_fetched TEXT,
      unread_count INTEGER DEFAULT 0 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,

		// Articles table - matches packages/db/src/schema.ts
		`CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT UNIQUE NOT NULL,
      content_snippet TEXT,
      content TEXT,
      pub_date TEXT,
      read INTEGER DEFAULT 0 NOT NULL,
      liked INTEGER DEFAULT 0 NOT NULL,
      saved INTEGER DEFAULT 0 NOT NULL,
      last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY(feed_id) REFERENCES feeds(id) ON DELETE CASCADE
    )`,
	];
}
