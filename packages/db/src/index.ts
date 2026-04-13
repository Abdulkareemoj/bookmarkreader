import type * as schema from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";

export type DB = LibSQLDatabase<typeof schema> | SQLJsDatabase<typeof schema>;

export {
	SCHEMA_VERSION,
	getCreateTableStatements,
	runMigrations,
	getSchemaVersion,
	needsMigration,
} from "./migrate";
