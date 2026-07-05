import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import * as schema from "@packages/db/src/schema";
import type { DB } from "@packages/db/src/index";
import { runMigrations } from "@packages/db";
import {
  createBookmarkAgent,
  createRssAgent,
  createHighlightAgent,
} from "@packages/utils";
import { drizzle } from "drizzle-orm/sql-js";
import { appDataDir } from "@tauri-apps/api/path";
import { readFile, writeFile, mkdir } from "@tauri-apps/plugin-fs";
import { createDesktopSyncAgent } from "./sync-agent";
import { createDesktopAuthAgent } from "./auth-agent";

const DB_FILENAME = "bookmark_tool.db";

let initializedAgents: {
  bookmarkAgent: ReturnType<typeof createBookmarkAgent>;
  rssAgent: ReturnType<typeof createRssAgent>;
  highlightAgent: ReturnType<typeof createHighlightAgent>;
  syncAgent: ReturnType<typeof createDesktopSyncAgent>;
  authAgent: ReturnType<typeof createDesktopAuthAgent>;
} | null = null;

async function getDbPath(): Promise<string> {
  const dir = await appDataDir();
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // dir may already exist
  }
  return `${dir}/${DB_FILENAME}`;
}

function setupAutoPersist(sqlJsDb: SqlJsDatabase) {
  let dirty = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const persistNow = async () => {
    const dbPath = await getDbPath();
    const data = sqlJsDb.export();
    await writeFile(dbPath, data);
    dirty = false;
  };

  const schedulePersist = () => {
    dirty = true;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      persistNow().catch((e) => console.error("[DB] Persist failed:", e));
    }, 500);
  };

  const wrapWrite = <T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const res = fn(...args);
      schedulePersist();
      return res;
    };
  };

  const anyClient = sqlJsDb as any;
  if (typeof anyClient.run === "function") {
    anyClient.run = wrapWrite(anyClient.run.bind(sqlJsDb));
  }
  if (typeof anyClient.exec === "function") {
    anyClient.exec = wrapWrite(anyClient.exec.bind(sqlJsDb));
  }

  // Persist before window closes
  window.addEventListener("beforeunload", () => {
    if (dirty) persistNow();
  });

  return { persistNow };
}

export async function initializeTauriAgents() {
  if (initializedAgents) {
    return initializedAgents;
  }

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sql-wasm.wasm`,
  });

  // Load existing DB or create new one
  let sqlJsDb: SqlJsDatabase;
  try {
    const dbPath = await getDbPath();
    const buffer = await readFile(dbPath);
    sqlJsDb = new SQL.Database(buffer);
  } catch {
    sqlJsDb = new SQL.Database();
  }

  // Set up auto-persistence
  setupAutoPersist(sqlJsDb);

  const db = drizzle(sqlJsDb, { schema });

  await runMigrations(db as unknown as DB);

  const genericDb = db as unknown as DB;
  const bookmarkAgent = createBookmarkAgent(genericDb);
  const rssAgent = createRssAgent(genericDb);
  const highlightAgent = createHighlightAgent(genericDb);
  const authAgent = createDesktopAuthAgent();
  const syncAgent = createDesktopSyncAgent(
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
