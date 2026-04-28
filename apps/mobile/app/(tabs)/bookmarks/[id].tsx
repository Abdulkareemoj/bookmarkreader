import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Heart, Share2, ExternalLink } from "lucide-react-native";
import { Linking, Pressable, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
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

	const handleShare = async () => {
		if (!bookmark.url) return;
		await Share.share({
			message: `${bookmark.title}\n${bookmark.url}`,
			url: bookmark.url,
			title: bookmark.title,
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between border-border border-b px-4 py-3">
				<Pressable
					onPress={() => router.back()}
					className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
				>
					<ArrowLeft size={20} className="text-foreground" />
				</Pressable>
				<View className="flex-row gap-2">
					<Pressable
						onPress={() => toggleLike(bookmark.id)}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Heart
							size={20}
							className={bookmark.liked ? "text-red-500" : "text-muted-foreground"}
							fill={bookmark.liked ? "#ef4444" : "none"}
						/>
					</Pressable>
					<Pressable
						onPress={() => toggleSave(bookmark.id)}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Bookmark
							size={20}
							className={bookmark.saved ? "text-blue-500" : "text-muted-foreground"}
							fill={bookmark.saved ? "#3b82f6" : "none"}
						/>
					</Pressable>
					<Pressable
						onPress={handleShare}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Share2 size={20} className="text-muted-foreground" />
					</Pressable>
					<Pressable
						onPress={handleOpenUrl}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<ExternalLink size={20} className="text-muted-foreground" />
					</Pressable>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-4 py-4">
				<Card className="gap-0 py-0">
					<CardContent className="p-4">
						<Text className="mb-3 text-2xl font-bold text-foreground">
							{bookmark.title}
						</Text>
						<Pressable onPress={handleOpenUrl} className="mb-4">
							<Text className="text-primary text-sm" numberOfLines={2}>
								{bookmark.url}
							</Text>
						</Pressable>

						<View className="mb-1 flex-row items-center justify-between border-border border-b pb-4">
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

						{bookmark.description && (
							<View className="mt-4">
								<Text className="mb-2 text-base font-semibold text-foreground">
									Description
								</Text>
								<Text className="text-base leading-6 text-muted-foreground">
									{bookmark.description}
								</Text>
							</View>
						)}

						{bookmark.tags && bookmark.tags.length > 0 && (
							<View className="mt-4">
								<Text className="mb-2 text-base font-semibold text-foreground">
									Tags
								</Text>
								<View className="flex-row flex-wrap gap-2">
									{bookmark.tags.map((tag: string, index: number) => (
										<View
											key={`${tag}-${index}`}
											className="rounded-full bg-secondary px-3 py-1"
										>
											<Text className="text-secondary-foreground text-sm">{tag}</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</CardContent>
				</Card>

				<View className="mt-6 gap-3">
					<Button onPress={handleOpenUrl} className="rounded-xl">
						<Icon as={ExternalLink} size={16} className="text-primary-foreground" />
						<Text>Open in Browser</Text>
					</Button>

					<Button
						onPress={handleDelete}
						variant="outline"
						className="rounded-xl border-destructive"
					>
						<Text className="text-destructive">Delete Bookmark</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}