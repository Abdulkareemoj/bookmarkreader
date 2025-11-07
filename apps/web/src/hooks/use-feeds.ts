import { useReaderStore } from "@/lib/store";
import { createUseFeeds } from "@packages/hooks";

export const useFeeds = createUseFeeds(useReaderStore);
