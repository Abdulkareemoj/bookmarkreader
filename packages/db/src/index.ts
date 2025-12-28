import type * as schema from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";

// Define a union type for the Drizzle client across platforms
export type DB =
  | LibSQLDatabase<typeof schema>
  | ExpoSQLiteDatabase<typeof schema>
  | SQLJsDatabase<typeof schema>;

// We no longer export platform-specific initialization functions from here.
// Initialization is handled in platform-specific files.
