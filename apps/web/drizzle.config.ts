import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/db/src/schema.ts", // Relative path to shared schema
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db", // Desktop/Web uses a local file
  },
  verbose: true,
  strict: true,
});
