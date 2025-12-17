import {
  createBookmarkAgent,
  createRssAgent,
  createSyncAgent,
} from "@packages/utils";
import { remoteApi } from "@packages/api";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";
import type { IAgents } from "@packages/utils"; // Import IAgents type

const DB_NAME = "bookmark_tool.db";

let initializedAgents: IAgents | null = null; // Singleton instance

export async function initializeMobileAgents(): Promise<IAgents> {
  if (initializedAgents) {
    return initializedAgents;
  }

  const expoDb = await openDatabaseAsync(DB_NAME);

  //initialize Drizzle client using the Expo driver
  const db = drizzle(expoDb, { schema }) as unknown as DB;

  // NOTE: Migrations are typically handled asynchronously in Expo.
  // We assume the store's loadInitialData handles the asynchronous wait.
  // For now, we rely on the synchronous initialization for the store hook.

  const bookmarkAgent = createBookmarkAgent(db);
  const rssAgent = createRssAgent(db);

  const localBookmarksWithDb = { ...bookmarkAgent, db: db };
  const localRssWithDb = { ...rssAgent, db: db };

  const syncAgent = createSyncAgent(
    localBookmarksWithDb,
    localRssWithDb,
    remoteApi
  );

  initializedAgents = { bookmarkAgent, rssAgent, syncAgent };
  return initializedAgents;
}

export function getInitializedMobileAgents(): IAgents {
  if (!initializedAgents) {
    throw new Error(
      "Agents not initialized. Call initializeMobileAgents() first."
    );
  }
  return initializedAgents;
}
