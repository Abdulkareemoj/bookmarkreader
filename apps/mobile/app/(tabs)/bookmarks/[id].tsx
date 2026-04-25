import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Heart, Share2, ExternalLink } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Linking } from "react-native";
import { useBookmarks } from "@/hooks/use-bookmarks";

export default function BookmarkDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { bookmarks, toggleLike, toggleSave, removeBookmark } = useBookmarks();

	const bookmark = bookmarks.find((b: any) => b.id === id);

	if (!bookmark) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-muted-foreground">Bookmark not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	const handleOpenUrl = () => {
		if (bookmark.url) {
			Linking.openURL(bookmark.url);
		}
	};

	const handleDelete = () => {
		removeBookmark(bookmark.id);
		router.back();
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between border-border border-b px-4 py-3">
				<TouchableOpacity onPress={() => router.back()}>
					<ArrowLeft size={24} className="text-foreground" />
				</TouchableOpacity>
				<View className="flex-row gap-3">
					<TouchableOpacity onPress={() => toggleLike(bookmark.id)}>
						<Heart
							size={24}
							className={bookmark.liked ? "text-red-500" : "text-muted-foreground"}
							fill={bookmark.liked ? "#ef4444" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => toggleSave(bookmark.id)}>
						<Bookmark
							size={24}
							className={bookmark.saved ? "text-blue-500" : "text-muted-foreground"}
							fill={bookmark.saved ? "#3b82f6" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleOpenUrl}>
						<ExternalLink size={24} className="text-muted-foreground" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-4 py-4">
				{/* Title */}
				<Text className="mb-3 font-bold text-2xl text-foreground">
					{bookmark.title}
				</Text>

				{/* URL */}
				<TouchableOpacity onPress={handleOpenUrl} className="mb-4">
					<Text className="text-primary text-sm" numberOfLines={2}>
						{bookmark.url}
					</Text>
				</TouchableOpacity>

				{/* Metadata */}
				<View className="mb-4 flex-row items-center justify-between border-border border-b pb-4">
					<View>
						<Text className="font-medium text-foreground text-sm">
							Added {new Date(bookmark.dateAdded).toLocaleDateString()}
						</Text>
						{bookmark.dateUpdated && (
							<Text className="mt-1 text-muted-foreground text-xs">
								Updated {new Date(bookmark.dateUpdated).toLocaleDateString()}
							</Text>
						)}
					</View>
				</View>

				{/* Description */}
				{bookmark.description && (
					<View className="mb-4">
						<Text className="mb-2 font-semibold text-foreground text-base">Description</Text>
						<Text className="text-muted-foreground text-base leading-6">
							{bookmark.description}
						</Text>
					</View>
				)}

				{/* Tags */}
				{bookmark.tags && bookmark.tags.length > 0 && (
					<View className="mb-4">
						<Text className="mb-2 font-semibold text-foreground text-base">Tags</Text>
						<View className="flex-row flex-wrap gap-2">
							{bookmark.tags.map((tag: string, index: number) => (
								<View
									key={index}
									className="rounded-full bg-secondary px-3 py-1"
								>
									<Text className="text-secondary-foreground text-sm">
										{tag}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Actions */}
				<View className="mt-6 space-y-3">
					<TouchableOpacity
						onPress={handleOpenUrl}
						className="rounded-lg bg-primary px-4 py-3 active:opacity-70"
					>
						<Text className="text-primary-foreground text-center font-medium">
							Open in Browser
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleDelete}
						className="rounded-lg border border-destructive px-4 py-3 active:opacity-70"
					>
						<Text className="text-destructive text-center font-medium">
							Delete Bookmark
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}