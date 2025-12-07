import { create } from "zustand";

export type SyncStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "syncing";

export interface SettingsState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  syncStatus: SyncStatus;

  // Actions
  setSupabaseConfig: (url: string, anonKey: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  // TODO: Add persistence logic (e.g., using zustand middleware)
}

export const createSettingsStore = (set: any): SettingsState => ({
  supabaseUrl: "",
  supabaseAnonKey: "",
  syncStatus: "idle",

  setSupabaseConfig: (url: string, anonKey: string) =>
    set({ supabaseUrl: url, supabaseAnonKey: anonKey }),

  setSyncStatus: (status: SyncStatus) => set({ syncStatus: status }),
});

export const useSettingsStore = create<SettingsState>(createSettingsStore);
