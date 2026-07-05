import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	envDir: path.resolve(__dirname, "../../"),
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../web/src"),
			"@packages/agents": path.resolve(
				__dirname,
				"../../packages/agents/src/index.ts",
			),
		},
	},
	server: {
		port: 1420,
		strictPort: true,
	},
});
