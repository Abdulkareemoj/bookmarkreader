import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../../web/src/router";
import { initializeTauriAgents } from "./db";
import { initializeReaderStore } from "@packages/store";

async function bootstrap() {
  const agents = await initializeTauriAgents();

  // Make agents available to shared web code (e.g. Settings page) without bundling
  // Tauri-only modules into the web build.
  (window as any).__BOOKMARKREADER_AGENTS__ = agents;

  const store = initializeReaderStore(agents);
  await store.getState().loadInitialData();

  // Get the configured router instance from the web app
  const router = getRouter();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

bootstrap();
