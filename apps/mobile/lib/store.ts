import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createReaderStore, ReaderState } from "@packages/store";

// In-memory storage
const inMemoryStorage = {
  setItem: (name: string, value: string) => {
    // In-memory implementation, does nothing for now
    return;
  },
  getItem: (name: string) => {
    // In-memory implementation, does nothing for now
    return null;
  },
  removeItem: (name: string) => {
    // In-memory implementation, does nothing for now
    return;
  },
};

export const useReaderStore = create<ReaderState>()(
  persist(createReaderStore, {
    name: "reader-store",
    storage: createJSONStorage(() => inMemoryStorage),
  })
);
