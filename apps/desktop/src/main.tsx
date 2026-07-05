import "../../web/src/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../../web/src/router";
import { initializeTauriAgents } from "./db";
import { initializeReaderStore } from "@packages/store";

async function bootstrap() {
	const agents = await initializeTauriAgents();

	(window as any).__BOOKMARKREADER_AGENTS__ = agents;

	agents.syncAgent.startAutoSync(30_000);

	const store = initializeReaderStore(agents);
	await store.getState().loadInitialData();

	const router = getRouter();

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>,
	);
}

bootstrap();
