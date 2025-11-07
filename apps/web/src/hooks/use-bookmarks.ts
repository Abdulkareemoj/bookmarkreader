import { createUseBookmarks } from "@packages/hooks";
import { useReaderStore } from "@/lib/store";

export const useBookmarks = createUseBookmarks(useReaderStore);