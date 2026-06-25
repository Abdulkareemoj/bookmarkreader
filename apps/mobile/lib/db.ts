import { runMigrations, SCHEMA_VERSION } from "@packages/db";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import {
	createBookmarkAgent,
	createRssAgent,
	createHighlightAgent,
	type IAgents,
} from "@packages/agents";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";
import { createMobileAuthAgent } from "./auth-agent";
import { createMobileSyncAgent } from "./sync-agent";
import { GOOGLE_OAUTH_CONFIG } from "./auth-config";

const DB_NAME = "bookmark_tool.db";

let initializedAgents: IAgents | null = null;

export async function initializeMobileAgents(): Promise<IAgents> {
	if (initializedAgents) return initializedAgents;

	const expoDb = await openDatabaseAsync(DB_NAME);
	const db = drizzle(expoDb as any, { schema }) as unknown as DB;

	await runMigrations(db);
	console.log(`[Mobile DB] Schema v${SCHEMA_VERSION} ready`);

	const bookmarkAgent = createBookmarkAgent(db);
	const rssAgent = createRssAgent(db);
	const highlightAgent = createHighlightAgent(db);
	const authAgent = createMobileAuthAgent(GOOGLE_OAUTH_CONFIG.clientId);
	const syncAgent = createMobileSyncAgent(
		authAgent,
		bookmarkAgent,
		rssAgent,
		highlightAgent,
	);

	initializedAgents = {
		bookmarkAgent,
		rssAgent,
		highlightAgent,
		syncAgent,
		authAgent,
	};
	return initializedAgents;
}

export function getInitializedMobileAgents(): IAgents {
	if (!initializedAgents) {
		throw new Error("Call initializeMobileAgents() first.");
	}
	return initializedAgents;
}
