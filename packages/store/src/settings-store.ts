// @packages/store/src/settings-store.ts
// App preferences + auth state for cloud storage sync.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SyncStatus =
	| "idle"
	| "connecting"
	| "connected"
	| "syncing"
	| "error";

export type SyncProvider = "gdrive" | "dropbox" | "icloud" | "none";
export type AuthProvider = "gdrive" | "dropbox" | "none";

export interface SettingsState {
	// Appearance
	theme: "light" | "dark" | "system";
	readerFontSize: "sm" | "md" | "lg";

	// Sync (OSS — file-based, bring your own storage)
	syncProvider: SyncProvider;
	syncStatus: SyncStatus;
	lastSyncedAt: string | null;

	// Auth (cloud storage access)
	isAuthenticated: boolean;
	authProvider: AuthProvider;
	authEmail: string | null;

	// YouTube (optional YouTube Data API key for handle resolution)
	youtubeApiKey: string;

	// Actions
	setTheme: (theme: SettingsState["theme"]) => void;
	setReaderFontSize: (size: SettingsState["readerFontSize"]) => void;
	setSyncProvider: (provider: SyncProvider) => void;
	setSyncStatus: (status: SyncStatus) => void;
	setLastSyncedAt: (at: string) => void;
	setAuth: (auth: {
		isAuthenticated: boolean;
		provider: AuthProvider;
		email: string | null;
	}) => void;
	clearAuth: () => void;
}

export const createSettingsStore = (set: any): SettingsState => ({
	theme: "system",
	readerFontSize: "md",
	syncProvider: "none",
	syncStatus: "idle",
	lastSyncedAt: null,
	isAuthenticated: false,
	authProvider: "none",
	authEmail: null,
	youtubeApiKey: "",

	setTheme: (theme) => set({ theme }),
	setReaderFontSize: (readerFontSize) => set({ readerFontSize }),
	setSyncProvider: (syncProvider) => set({ syncProvider }),
	setSyncStatus: (syncStatus) => set({ syncStatus }),
	setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
	setYoutubeApiKey: (key: string) => set({ youtubeApiKey: key }),
	setAuth: (auth) =>
		set({
			isAuthenticated: auth.isAuthenticated,
			authProvider: auth.provider,
			authEmail: auth.email,
		}),
	clearAuth: () =>
		set({
			isAuthenticated: false,
			authProvider: "none",
			authEmail: null,
		}),
});

export const useSettingsStore = create<SettingsState>()(
	persist(createSettingsStore, {
		name: "reader-settings",
		partialize: (s) => ({
			theme: s.theme,
			readerFontSize: s.readerFontSize,
			syncProvider: s.syncProvider,
			lastSyncedAt: s.lastSyncedAt,
			isAuthenticated: s.isAuthenticated,
			authProvider: s.authProvider,
			authEmail: s.authEmail,
			youtubeApiKey: s.youtubeApiKey,
		}),
	}),
);
