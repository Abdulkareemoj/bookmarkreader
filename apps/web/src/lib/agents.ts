import { getInitializedWebAgents } from "@/lib/db";
import type { IAgents } from "@packages/utils";

// This file serves as a helper to access the globally initialized agents
// after `initializeWebAgents()` has been called in the application entry point.

/**
 * Retrieves the singleton instance of initialized agents.
 * Must only be called after the agents have been successfully initialized.
 */
export function getInitializedAgents(): IAgents {
  const injectedAgents =
    typeof window !== "undefined"
      ? ((window as any).__BOOKMARKREADER_AGENTS__ as IAgents | undefined)
      : undefined;

  if (injectedAgents) {
    return injectedAgents;
  }

  return getInitializedWebAgents();
}
