import { useReaderStore } from "@/lib/store";
import { createUseHighlights } from "@packages/hooks";

export const useHighlights = createUseHighlights(useReaderStore);
