/* This file is responsible for running database migrations and also keeps track to make sure the apps are running the correct schema version. It also provides the SQL statements needed to create the tables, which is used by the web/mobile implementations that don't have filesystem access to run separate migration scripts.
 * This allows us to initialize the web/mobile database without filesystem access
 * The schema source is in packages/db/src/schema.ts
 */


import { SCHEMA_VERSION, getCreateTableStatements } from "./schema-to-sql";
import type { DB } from "./index";
import { sql } from "drizzle-orm";

export async function runMigrations(db: DB): Promise<void> {
	const statements = getCreateTableStatements();

	for (const sqlStmt of statements) {
		await db.run(sql.raw(sqlStmt));
	}

	await db.run(
		sql.raw(
			"INSERT OR IGNORE INTO schema_version (version) VALUES (" +
				SCHEMA_VERSION +
				")",
		),
	);
}

export async function getSchemaVersion(db: DB): Promise<number> {
	try {
		const result = await db.all<{ version: number }>(
			"SELECT version FROM schema_version ORDER BY version DESC LIMIT 1",
		);
		return result[0]?.version ?? 0;
	} catch {
		return 0;
	}
}

export async function needsMigration(db: DB): Promise<boolean> {
	const currentVersion = await getSchemaVersion(db);
	return currentVersion < SCHEMA_VERSION;
}

export { SCHEMA_VERSION, getCreateTableStatements };
