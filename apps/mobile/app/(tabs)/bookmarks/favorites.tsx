import type { Bookmark } from "@packages/store";
import { router, Stack } from "expo-router";
import {
	ArrowLeft,
	BookmarkIcon,
	Heart,
	LayoutGrid,
	List,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { FlatList, Linking, Pressable, View } from "react-native";
import BookmarkCard from "@/components/bookmark-card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useBookmarks } from "@/hooks/use-bookmarks";

type ViewMode = "list" | "grid";

export default function FavoritesPage() {
	const { bookmarks, toggleLike, toggleSave, removeBookmark } =
		useBookmarks("favorites");
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	const handleBookmarkPress = (url: string) => {
		Linking.openURL(url);
	};

	const renderBookmarkItem = useCallback(
		({ item }: { item: Bookmark }) => (
			<View className={viewMode === "grid" ? "flex-1" : ""}>
				<BookmarkCard
					id={item.id}
					title={item.title}
					url={item.url}
					favicon={item.favicon ?? undefined}
					tags={item.tags}
					liked={item.liked}
					saved={item.saved}
					onLike={() => toggleLike(item.id)}
					onSave={() => toggleSave(item.id)}
					onDelete={() => removeBookmark(item.id)}
					onOpenExternal={() => handleBookmarkPress(item.url)}
				/>
			</View>
		),
		[handleBookmarkPress, removeBookmark, toggleLike, toggleSave, viewMode],
	);

	const keyExtractor = useCallback((item: Bookmark) => item.id, []);

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Favorites",
					headerLeft: () => (
						<Pressable onPress={() => router.back()}>
							<ArrowLeft size={24} className="text-foreground mx-2" />
						</Pressable>
					),
				}}
			/>

			<View className="flex-row items-center justify-between px-4 pt-3 pb-2">
				<Text className="font-bold text-xl text-foreground">
					{bookmarks.length} favorite{bookmarks.length !== 1 ? "s" : ""}
				</Text>
				<View className="flex-row rounded-xl border border-border bg-card p-1">
					<Pressable
						onPress={() => setViewMode("list")}
						className={`rounded-lg px-3 py-2 ${
							viewMode === "list" ? "bg-secondary" : "bg-transparent"
						}`}
					>
						<Icon as={List} size={20} className="text-foreground" />
					</Pressable>
					<Pressable
						onPress={() => setViewMode("grid")}
						className={`ml-1 rounded-lg px-3 py-2 ${
							viewMode === "grid" ? "bg-secondary" : "bg-transparent"
						}`}
					>
						<Icon as={LayoutGrid} size={20} className="text-foreground" />
					</Pressable>
				</View>
			</View>

			{bookmarks.length > 0 ? (
				<FlatList
					data={bookmarks}
					renderItem={renderBookmarkItem}
					keyExtractor={keyExtractor}
					numColumns={viewMode === "grid" ? 2 : 1}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: 20,
					}}
					columnWrapperStyle={viewMode === "grid" ? { gap: 12 } : undefined}
					showsVerticalScrollIndicator={false}
				/>
			) : (
				<View className="flex-1 items-center justify-center px-4">
					<Icon as={Heart} size={48} className="mb-4 text-muted-foreground" />
					<Text className="mb-2 font-semibold text-lg text-muted-foreground text-center">
						No favorites yet
					</Text>
					<Text className="text-muted-foreground text-sm text-center">
						Mark bookmarks as favorites by toggling the heart icon.
					</Text>
				</View>
			)}
		</View>
	);
}
