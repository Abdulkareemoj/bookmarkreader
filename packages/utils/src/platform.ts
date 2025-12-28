import type { IBookmarkAgent, IRssAgent, ISyncAgent } from "./index";

export interface IAgents {
  bookmarkAgent: IBookmarkAgent;
  rssAgent: IRssAgent;
  syncAgent: ISyncAgent;
}

let initializedAgents: IAgents | null = null;

export async function initializeAgents(): Promise<IAgents> {
  // NOTE: We use dynamic imports to ensure platform-specific dependencies are not bundled unnecessarily.

  // Check for Tauri environment (Node-like context, but often has __TAURI__ global)
  if (
    // @ts-ignore
    typeof window === "undefined" ||
    // @ts-ignore
    (typeof window !== "undefined" && (window as any).__TAURI__)
  ) {
    // Tauri/Node environment
    // @ts-ignore
    const { initializeTauriAgents } = await import(
      "../../../apps/desktop/src/db"
    );
    const agents = await initializeTauriAgents();
    initializedAgents = agents;
    return agents;
  }
  if (
    // @ts-ignore
    typeof navigator !== "undefined" &&
    // @ts-ignore
    (navigator as any).product === "ReactNative"
  ) {
    // Mobile (Expo/React Native) environment
    // @ts-ignore
    const { initializeMobileAgents } = await import(
      "../../../apps/mobile/lib/db"
    );
    const agents = await initializeMobileAgents();
    initializedAgents = agents;
    return agents;
  }
  // Browser/Web environment
  // ../../../ts-ignore
  const { initializeWebAgents } = await import("../../../apps/web/src/lib/db");
  const agents = await initializeWebAgents();
  initializedAgents = agents;
  return agents;
}

export function getInitializedAgents(): IAgents {
  if (!initializedAgents) {
    throw new Error("Agents not initialized. Call initializeAgents() first.");
  }
  return initializedAgents;
}
