import "../../web/src/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../../web/src/router";
import { initializeTauriAgents } from "./db";
import { initializeReaderStore } from "@packages/store";
import { invoke } from "@tauri-apps/api/core";

async function bootstrap() {
	const agents = await initializeTauriAgents();

	(window as any).__BOOKMARKREADER_AGENTS__ = agents;

	agents.syncAgent.startAutoSync(30_000);

	const store = initializeReaderStore(agents);
	await store.getState().loadInitialData();

	// Set up platform YouTube handle resolver (desktop uses native Rust command)
	(window as any).__RESOLVE_YOUTUBE_HANDLE__ = async (input: string) => {
		try {
			// Extract just the handle name from various input formats
			let handle = input.trim();
			if (handle.includes("youtube.com") || handle.includes("youtu.be")) {
				try {
					const pathname = new URL(handle).pathname;
					const parts = pathname.split("/").filter(Boolean);
					handle = parts.find((p) => p.startsWith("@"))?.slice(1) ?? "";
				} catch {
					// fall through
				}
			}
			handle = handle.replace(/^@/, "");
			if (!handle) return null;

			const channelId = await invoke<string>("resolve_youtube_handle", {
				handle,
			});
			if (channelId) {
				return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
			}
		} catch (e) {
			console.error("[youtube-resolver] Tauri command failed:", e);
		}
		return null;
	};

	const router = getRouter();

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
}

bootstrap();
