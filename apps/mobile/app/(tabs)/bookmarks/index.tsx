import type { Bookmark } from "@packages/store";
import { router, useLocalSearchParams } from "expo-router";
import { BookmarkIcon, LayoutGrid, List, Menu } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Linking, TouchableOpacity, View } from "react-native";
import { AddBookmarkModal } from "@/components/add-bookmark-modal";
import BookmarkCard from "@/components/bookmark-card";
import { CollectionsBottomSheet } from "@/components/collections-bottom-sheet";
import { EditBookmarkModal } from "@/components/edit-bookmark-modal";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useBookmarks } from "@/hooks/use-bookmarks";

type ViewMode = "list" | "grid";

export default function Bookmarks() {
	const { searchQuery, collectionId = "all" } = useLocalSearchParams();
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const { bookmarks, toggleLike, toggleSave, removeBookmark, addBookmark } =
		useBookmarks(collectionId as string);

	const search =
		(Array.isArray(searchQuery)
			? searchQuery[0]
			: searchQuery
		)?.toLowerCase() || "";

	const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) => {
		const titleMatch = bookmark.title.toLowerCase().includes(search);
		const urlMatch = bookmark.url?.toLowerCase().includes(search) || false;
		const tagMatch =
			bookmark.tags?.some((tag: string) =>
				tag.toLowerCase().includes(search),
			) || false;
		return titleMatch || urlMatch || tagMatch;
	});

	const handleBookmarkPress = (url: string) => {
		Linking.openURL(url);
	};

	const handleEdit = (bookmark: Bookmark) => {
		setEditingBookmark(bookmark);
	};

	const handleUpdate = (data: Partial<Bookmark>) => {
		// This will be handled by the store through the modal
		console.log("Bookmark updated:", data);
	};

	const handleCollectionChange = (id: string) => {
		// Navigate to the selected collection
		router.setParams({ collectionId: id });
	};

	const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
		<BookmarkCard
			{...item}
			onLike={() => toggleLike(item.id)}
			onSave={() => toggleSave(item.id)}
			onDelete={() => removeBookmark(item.id)}
			onOpenExternal={() => handleBookmarkPress(item.url)}
			onEdit={() => handleEdit(item)}
		/>
	);

	return (
		<View className="flex-1 bg-background">
			{/* View Mode Toggle */}
			<View className="flex-row justify-between p-4 pb-2">
				<TouchableOpacity
					onPress={() => setIsSidebarOpen(true)}
					className="rounded-full p-2 active:bg-accent"
				>
					<Menu size={22} className="text-primary" />
				</TouchableOpacity>

				<View className="flex-row">
					<TouchableOpacity
						onPress={() => setViewMode("list")}
						className={`rounded-md p-2 ${
							viewMode === "list" ? "bg-muted" : "bg-transparent"
						}`}
					>
						<Icon as={List} size={20} className="text-foreground" />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setViewMode("grid")}
						className={`ml-2 rounded-md p-2 ${
							viewMode === "grid" ? "bg-muted" : "bg-transparent"
						}`}
					>
						<Icon as={LayoutGrid} size={20} className="text-foreground" />
					</TouchableOpacity>
				</View>
			</View>

			{filteredBookmarks.length > 0 ? (
				<FlatList
					data={filteredBookmarks}
					renderItem={renderBookmarkItem}
					keyExtractor={(item) => item.id}
					numColumns={viewMode === "grid" ? 2 : 1}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: 16,
						...(viewMode === "grid" && { gap: 12 }),
					}}
					columnWrapperStyle={viewMode === "grid" ? { gap: 12 } : undefined}
				/>
			) : (
				<View className="flex-1 items-center justify-center">
					<Icon
						as={BookmarkIcon}
						size={48}
						className="mb-4 text-muted-foreground"
					/>
					<Text className="mb-2 font-semibold text-lg text-muted-foreground">
						No bookmarks found
					</Text>
					<Text className="text-muted-foreground text-sm">
						{searchQuery
							? "Try adjusting your search query"
							: "No bookmarks available"}
					</Text>
					<View className="p-4">
						<AddBookmarkModal
							onAddBookmark={(data) => {
								console.log("[BookmarksPage] Adding bookmark:", data);
								addBookmark({
									...data,
									tags: [],
								});
							}}
						/>
					</View>
				</View>
			)}

			{/* Edit Bookmark Modal */}
			<EditBookmarkModal
				bookmark={editingBookmark}
				isOpen={!!editingBookmark}
				onClose={() => setEditingBookmark(null)}
				onUpdate={handleUpdate}
			/>

			{/* Collections Bottom Sheet */}
			<CollectionsBottomSheet
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				activeTab={(collectionId as string) || "all"}
				onTabChange={handleCollectionChange}
			/>
		</View>
	);
}
