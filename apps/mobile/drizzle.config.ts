import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../packages/db/src/schema.ts", // Relative path to shared schema
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo", // Required for Expo/React Native migrations
  verbose: true,
  strict: true,
});
