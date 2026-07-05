import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const config = defineConfig({
	envDir: path.resolve(__dirname, "../../"),
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact({
			jsxImportSource: "react",
			babel: {
				plugins: ["@babel/plugin-transform-flow-strip-types"],
			},
		}),
	],
	resolve: {
		alias: {
			"react-native": "react-native-web",
			"drizzle-orm/expo-sqlite": path.resolve(__dirname, "src/lib/db-stubs.ts"),
			"expo-sqlite": path.resolve(__dirname, "src/lib/db-stubs.ts"),
			expo: "wa-sqlite",
		},
		extensions: [
			".web.js",
			".web.jsx",
			".web.ts",
			".web.tsx",
			".js",
			".jsx",
			".ts",
			".tsx",
			".json",
		],
	},
	optimizeDeps: {
		exclude: [
			"expo",
			"expo-modules-core",
			"expo-sqlite",
			"react-native",
			"react-native-web",
			"@expo/vector-icons",
		],
	},
	tsconfigPaths: true,
});

export default config;
