import {
	getCreateTableStatements,
	runMigrations,
	SCHEMA_VERSION,
} from "@packages/db";
import type { DB } from "@packages/db/src/index";
import * as schema from "@packages/db/src/schema";
import {
	createBookmarkAgent,
	createRssAgent,
	createHighlightAgent,
	type IAgents,
} from "@packages/agents";
import { createWebSyncAgent } from "@/lib/sync-agent";
import { createWebAuthAgent } from "@/lib/auth-agent";
import { drizzle } from "drizzle-orm/sql-js";
import type { Database } from "sql.js";
import initSqlJs from "sql.js";

const DB_NAME = "bookmark_tool_web.db";

const IDB_DB_NAME = "bookmark_tool_web";
const IDB_STORE = "sqlite";
const IDB_KEY = DB_NAME;

function openIdb() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(IDB_DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(IDB_STORE)) {
				db.createObjectStore(IDB_STORE);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function idbGet(key: string) {
	const db = await openIdb();
	try {
		return await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
			const tx = db.transaction(IDB_STORE, "readonly");
			const store = tx.objectStore(IDB_STORE);
			const req = store.get(key);
			req.onsuccess = () => resolve(req.result as ArrayBuffer | undefined);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}

async function idbSet(key: string, value: ArrayBuffer) {
	const db = await openIdb();
	try {
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(IDB_STORE, "readwrite");
			const store = tx.objectStore(IDB_STORE);
			store.put(value, key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}

function setupPersistence(client: Database) {
	let dirty = false;
	let saveTimer: number | null = null;
	let saving = false;

	const persistNow = async () => {
		if (saving) return;
		if (!dirty) return;
		saving = true;
		try {
			const data = client.export();
			const copy = data.slice().buffer;
			await idbSet(IDB_KEY, copy);
			dirty = false;
		} finally {
			saving = false;
		}
	};

	const schedulePersist = () => {
		dirty = true;
		if (saveTimer) return;
		saveTimer = window.setTimeout(() => {
			saveTimer = null;
			void persistNow().catch((e) => console.error("Persist failed:", e));
		}, 500);
	};

	const wrapWrite = <T extends (...args: any[]) => any>(fn: T) => {
		return (...args: Parameters<T>): ReturnType<T> => {
			const res = fn(...args);
			schedulePersist();
			return res;
		};
	};

	const anyClient = client as any;
	if (typeof anyClient.run === "function") {
		anyClient.run = wrapWrite(anyClient.run.bind(client));
	}
	if (typeof anyClient.exec === "function") {
		anyClient.exec = wrapWrite(anyClient.exec.bind(client));
	}
	if (typeof anyClient.prepare === "function") {
		const origPrepare = anyClient.prepare.bind(client);
		anyClient.prepare = (...args: any[]) => {
			const stmt = origPrepare(...args);
			const anyStmt = stmt as any;
			if (anyStmt && typeof anyStmt.run === "function") {
				anyStmt.run = wrapWrite(anyStmt.run.bind(stmt));
			}
			return stmt;
		};
	}

	const onVis = () => {
		if (document.visibilityState === "hidden") {
			void persistNow().catch(() => undefined);
		}
	};
	document.addEventListener("visibilitychange", onVis);
	window.addEventListener("beforeunload", () => {
		void persistNow().catch(() => undefined);
	});

	return { persistNow };
}

let initializedAgents: {
	bookmarkAgent: ReturnType<typeof createBookmarkAgent>;
	rssAgent: ReturnType<typeof createRssAgent>;
	highlightAgent: ReturnType<typeof createHighlightAgent>;
	syncAgent: ReturnType<typeof createWebSyncAgent>;
	authAgent: ReturnType<typeof createWebAuthAgent>;
} | null = null;

// Function to initialize the Drizzle client and agents asynchronously
export async function initializeWebAgents() {
	if (initializedAgents) {
		return initializedAgents;
	}

	// 1. Initialize sql.js (loads WASM)
	// Tell sql.js where to find the WASM file
	const SQL = await initSqlJs({
		locateFile: (filename: string) => {
			return "/sql-wasm.wasm";
		},
	});

	// 2. Create an in-memory database client
	// NOTE: This is in-memory by default. Persistence requires manual handling (e.g., saving/loading to IndexedDB).
	const saved =
		typeof indexedDB !== "undefined" ? await idbGet(IDB_KEY) : undefined;
	const client: Database = saved
		? new SQL.Database(new Uint8Array(saved))
		: new SQL.Database();

	const { persistNow } = setupPersistence(client);

	// 3. Run migrations directly on sql.js client
	const drizzleDb = drizzle(client, { schema });
	await runMigrations(drizzleDb as unknown as DB);
	await persistNow();
	console.log(`[Web DB] Schema initialized to version ${SCHEMA_VERSION}`);

	// 4. Initialize Drizzle client
	const db = drizzle(client, { schema });

	// 5. Initialize agents with the Drizzle client
	// We assert the type to the generic DB union type for agent compatibility
	const genericDb = db as unknown as DB;
	const bookmarkAgent = createBookmarkAgent(genericDb);
	const rssAgent = createRssAgent(genericDb);
	const highlightAgent = createHighlightAgent(genericDb);
	const authAgent = createWebAuthAgent();
	const syncAgent = createWebSyncAgent(
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

export function getInitializedWebAgents(): IAgents {
	if (!initializedAgents) {
		throw new Error(
			"Agents not initialized. Call initializeWebAgents() first.",
		);
	}
	return initializedAgents as IAgents;
}
