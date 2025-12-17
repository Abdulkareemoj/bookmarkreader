import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ReaderState,
  type SettingsState,
  createSettingsStore,
  initializeReaderStore,
  useReaderStore as sharedUseReaderStore,
} from "@packages/store";

// Web-specific persisted Settings Store (only persists configuration)
export const useSettingsStore = create<SettingsState>()(
  persist(createSettingsStore, {
    name: "settings-store",
    partialize: (state) => ({
      supabaseUrl: state.supabaseUrl,
      supabaseAnonKey: state.supabaseAnonKey,
    }),
    version: 1,
  })
);

// We must use the initialized store instance provided by initializeReaderStore,
// and export the hook for consumption.
export {
  initializeReaderStore,
  sharedUseReaderStore as useReaderStore,
  type ReaderState,
};
