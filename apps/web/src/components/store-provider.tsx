import type React from "react";
import { useEffect, useState } from "react";
import type { StoreApi } from "zustand";
import { initializeWebAgents } from "@/lib/db";
import { initializeReaderStore, type ReaderState } from "@/lib/store";

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<unknown>(null);

	type InitializedStore = StoreApi<ReaderState>;

	useEffect(() => {
		async function setup() {
			try {
				const injectedAgents =
					typeof window !== "undefined"
						? (globalThis as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
								.__BOOKMARKREADER_AGENTS__
						: undefined;

				if (injectedAgents) {
					setIsInitialized(true);
					return;
				}

				const agents = await initializeWebAgents();
				const store = initializeReaderStore(
					agents,
				) as unknown as InitializedStore;
				await store.getState().loadInitialData();
				setIsInitialized(true);
			} catch (e) {
				console.error("Failed to initialize application:", e);
				setInitError(e);
			}
		}
		setup();
	}, []);

	if (initError) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
				<div className="font-medium text-foreground">
					Failed to initialize application
				</div>
				<div className="text-sm">
					Refresh the page. If this keeps happening, clear site data for this
					origin (IndexedDB) and try again.
				</div>
			</div>
		);
	}

	if (!isInitialized) {
		// Render loading state for web app
		return (
			<div className="flex h-screen items-center justify-center text-gray-500">
				Loading data...
			</div>
		);
	}

	return <>{children}</>;
}
