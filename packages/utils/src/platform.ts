
import type { IBookmarkAgent, IRssAgent } from "./index";

export interface IAgents {
	bookmarkAgent: IBookmarkAgent;
	rssAgent: IRssAgent;
}

let initializedAgents: IAgents | null = null;

function isTauri(): boolean {
	return (
		typeof window !== "undefined" &&
		// Tauri v1
		((window as any).__TAURI__ !== undefined ||
			// Tauri v2
			(window as any).__TAURI_INTERNALS__ !== undefined)
	);
}

function isReactNative(): boolean {
	// navigator.product is deprecated but React Native still sets it
	// More reliable: check for the global that RN always defines
	return (
		(typeof global !== "undefined" &&
			typeof (global as any).nativeCallSyncHook !== "undefined") ||
		(typeof navigator !== "undefined" && navigator.product === "ReactNative")
	);
}

function isNode(): boolean {
	return (
		typeof process !== "undefined" &&
		process.versions != null &&
		process.versions.node != null &&
		typeof window === "undefined"
	);
}

export async function initializeAgents(): Promise<IAgents> {
	if (initializedAgents) return initializedAgents;

	if (isTauri()) {
		const { initializeTauriAgents } = await import(
			"../../../apps/desktop/src/db"
		);
		initializedAgents = await initializeTauriAgents();
		return initializedAgents;
	}

	if (isReactNative()) {
		const { initializeMobileAgents } = await import(
			"../../../apps/mobile/lib/db"
		);
		initializedAgents = await initializeMobileAgents();
		return initializedAgents;
	}

	// Web (browser) — default
	const { initializeWebAgents } = await import("../../../apps/web/src/lib/db");
	initializedAgents = await initializeWebAgents();
	return initializedAgents;
}

export function getInitializedAgents(): IAgents {
	if (!initializedAgents) {
		throw new Error("Agents not initialized. Call initializeAgents() first.");
	}
	return initializedAgents;
}

/** Reset — useful for testing or re-init after logout */
export function resetAgents(): void {
	initializedAgents = null;
}