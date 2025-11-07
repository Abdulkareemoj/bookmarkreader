import { useReaderStore } from "@/lib/store";
import { createUseBookmarks } from "@packages/hooks";

export const useBookmarks = createUseBookmarks(useReaderStore);
