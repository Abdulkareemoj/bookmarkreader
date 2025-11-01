import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CollectionItem {
	id: string; // slug id
	name: string;
}

interface CollectionsState {
	bookmarkCollections: CollectionItem[];
	rssCollections: CollectionItem[];
	addBookmarkCollection: (name: string) => void;
	addRssCollection: (name: string) => void;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export const useCollectionsStore = create<CollectionsState>()(
	persist(
		(set, get) => ({
			bookmarkCollections: [
				{ id: "all", name: "All Bookmarks" },
			],
			rssCollections: [
				{ id: "all", name: "All Feeds" },
			],
			addBookmarkCollection: (name) =>
				set((state) => {
					const id = slugify(name);
					if (state.bookmarkCollections.some((c) => c.id === id)) return state;
					return {
						bookmarkCollections: [...state.bookmarkCollections, { id, name }],
					};
				}),
			addRssCollection: (name) =>
				set((state) => {
					const id = slugify(name);
					if (state.rssCollections.some((c) => c.id === id)) return state;
					return {
						rssCollections: [...state.rssCollections, { id, name }],
					};
				}),
		}),
		{ name: "collections-store" },
	),
);
