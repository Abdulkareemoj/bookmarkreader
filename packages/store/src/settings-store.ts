// @packages/store/src/settings-store.ts
// Sync is handled separately per platform — this just holds app preferences.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SyncStatus =
	| "idle"
	| "connecting"
	| "connected"
	| "syncing"
	| "error";

export type SyncProvider = "gdrive" | "dropbox" | "icloud" | "none";

export interface SettingsState {
	// Appearance
	theme: "light" | "dark" | "system";
	readerFontSize: "sm" | "md" | "lg";

	// Sync (OSS — file-based, bring your own storage)
	syncProvider: SyncProvider;
	syncStatus: SyncStatus;
	lastSyncedAt: string | null;

	// Actions
	setTheme: (theme: SettingsState["theme"]) => void;
	setReaderFontSize: (size: SettingsState["readerFontSize"]) => void;
	setSyncProvider: (provider: SyncProvider) => void;
	setSyncStatus: (status: SyncStatus) => void;
	setLastSyncedAt: (at: string) => void;
}

export const createSettingsStore = (set: any): SettingsState => ({
	theme: "system",
	readerFontSize: "md",
	syncProvider: "none",
	syncStatus: "idle",
	lastSyncedAt: null,

	setTheme: (theme) => set({ theme }),
	setReaderFontSize: (readerFontSize) => set({ readerFontSize }),
	setSyncProvider: (syncProvider) => set({ syncProvider }),
	setSyncStatus: (syncStatus) => set({ syncStatus }),
	setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
});

export const useSettingsStore = create<SettingsState>()(
	persist(createSettingsStore, {
		name: "reader-settings",
		partialize: (s) => ({
			theme: s.theme,
			readerFontSize: s.readerFontSize,
			syncProvider: s.syncProvider,
			lastSyncedAt: s.lastSyncedAt,
		}),
	}),
);