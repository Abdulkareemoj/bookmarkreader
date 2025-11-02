import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createReaderStore, ReaderState } from "@packages/store";

export const useReaderStore = create<ReaderState>()(
  persist(createReaderStore, {
    name: "reader-store",
  })
);
