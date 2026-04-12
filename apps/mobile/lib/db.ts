import { remoteApi } from "@packages/api";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import type { IAgents } from "@packages/utils";
import {
	createBookmarkAgent,
	createRssAgent,
	createSyncAgent,
} from "@packages/utils";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";
import { getCreateTableStatements, SCHEMA_VERSION } from "@packages/db";

const DB_NAME = "bookmark_tool.db";

let initializedAgents: IAgents | null = null;

export async function initializeMobileAgents(): Promise<IAgents> {
	if (initializedAgents) {
		return initializedAgents;
	}

	const expoDb = await openDatabaseAsync(DB_NAME);
	const db = drizzle(expoDb as any, { schema }) as unknown as DB;

	const statements = getCreateTableStatements();
	for (const sqlStmt of statements) {
		await expoDb.execAsync(sqlStmt);
	}
	await expoDb.execAsync(
		"INSERT OR IGNORE INTO schema_version (version) VALUES (" +
			SCHEMA_VERSION +
			")",
	);
	console.log(`[Mobile DB] Schema initialized to version ${SCHEMA_VERSION}`);

	const bookmarkAgent = createBookmarkAgent(db);
	const rssAgent = createRssAgent(db);

	const localBookmarksWithDb = { ...bookmarkAgent, db: db };
	const localRssWithDb = { ...rssAgent, db: db };

	const syncAgent = createSyncAgent(
		localBookmarksWithDb,
		localRssWithDb,
		remoteApi,
	);

	initializedAgents = { bookmarkAgent, rssAgent, syncAgent };
	return initializedAgents;
}

export function getInitializedMobileAgents(): IAgents {
	if (!initializedAgents) {
		throw new Error(
			"Agents not initialized. Call initializeMobileAgents() first.",
		);
	}
	return initializedAgents;
}
