import { createClient } from "@libsql/client";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import {
	createBookmarkAgent,
	createRssAgent,
	createHighlightAgent,
} from "@packages/utils";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const DB_PATH = "file:bookmark_tool.db";

let initializedAgents: {
	bookmarkAgent: ReturnType<typeof createBookmarkAgent>;
	rssAgent: ReturnType<typeof createRssAgent>;
	highlightAgent: ReturnType<typeof createHighlightAgent>;
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
	const highlightAgent = createHighlightAgent(genericDb);

	initializedAgents = { bookmarkAgent, rssAgent, highlightAgent };
	return initializedAgents;
}
