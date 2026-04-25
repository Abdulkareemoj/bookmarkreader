import { createClient } from "@libsql/client";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import {
	createBookmarkAgent,
	createNoopRemoteApi,
	createRssAgent,
	createSyncAgent,
} from "@packages/utils";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const DB_PATH = "file:bookmark_tool.db";

let initializedAgents: {
	bookmarkAgent: ReturnType<typeof createBookmarkAgent>;
	rssAgent: ReturnType<typeof createRssAgent>;
	syncAgent: ReturnType<typeof createSyncAgent>;
} | null = null;

//  initialize the Drizzle client and agents asynchronously for Tauri
export async function initializeTauriAgents() {
	if (initializedAgents) {
		return initializedAgents;
	}

	const client = createClient({ url: DB_PATH });
	const db = drizzle(client, { schema });

	//migrations folder path is relative to the execution context (apps/desktop)
	await migrate(db, { migrationsFolder: "./drizzle" });

	// Initialize agents with the Drizzle client
	//assert the type to the generic DB union type for agent compatibility
	const genericDb = db as unknown as DB;
	const bookmarkAgent = createBookmarkAgent(genericDb);
	const rssAgent = createRssAgent(genericDb);

	const localBookmarksWithDb = { ...bookmarkAgent, db: genericDb };
	const localRssWithDb = { ...rssAgent, db: genericDb };

	const remoteApi = createNoopRemoteApi();

	const syncAgent = createSyncAgent(
		localBookmarksWithDb,
		localRssWithDb,
		remoteApi,
	);

	initializedAgents = { bookmarkAgent, rssAgent, syncAgent };
	return initializedAgents;
}
