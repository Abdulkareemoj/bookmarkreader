import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ArrowLeft,
	Bookmark,
	Copy,
	ExternalLink,
	Heart,
	Share2,
	Trash2,
} from "lucide-react-native";
import { Alert, Image, Linking, Pressable, ScrollView, Share, View } from "react-native";
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
		Alert.alert(
			"Delete Bookmark",
			`Are you sure you want to delete "${bookmark.title}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						removeBookmark(bookmark.id);
						router.back();
					},
				},
			],
		);
	};

	const handleCopyUrl = async () => {
		await Clipboard.setStringAsync(bookmark.url);
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
							color={bookmark.liked ? "#ef4444" : "#6b7280"}
							fill={bookmark.liked ? "#ef4444" : "none"}
						/>
					</Pressable>
					<Pressable
						onPress={() => toggleSave(bookmark.id)}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Bookmark
							size={20}
							color={bookmark.saved ? "#3b82f6" : "#6b7280"}
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
				{/* Header with Favicon */}
				<View className="mb-6 flex-row items-start gap-4">
					<View className="size-14 items-center justify-center rounded-2xl bg-muted shadow-sm">
						{bookmark.favicon ? (
							<Image
								source={{ uri: bookmark.favicon }}
								className="size-9"
								resizeMode="contain"
							/>
						) : (
							<ExternalLink size={24} className="text-muted-foreground" />
						)}
					</View>
					<View className="flex-1 gap-1">
						<Text className="text-2xl font-bold text-foreground" numberOfLines={3}>
							{bookmark.title}
						</Text>
						<Pressable onPress={handleOpenUrl}>
							<Text className="text-primary text-sm" numberOfLines={2}>
								{bookmark.url}
							</Text>
						</Pressable>
					</View>
				</View>

				<Card className="gap-0 py-0">
					<CardContent className="p-4">
						{/* Date Info */}
						<View className="mb-4 flex-row items-center justify-between border-border border-b pb-4">
							<View>
								<Text className="font-medium text-foreground text-sm">
									Added {new Date(bookmark.dateAdded).toLocaleDateString()}
								</Text>
								{bookmark.lastUpdatedAt && (
									<Text className="mt-1 text-muted-foreground text-xs">
										Updated{" "}
										{new Date(bookmark.lastUpdatedAt).toLocaleDateString()}
									</Text>
								)}
							</View>
						</View>

						{/* Description */}
						{bookmark.description && (
							<View className="mb-4">
								<Text className="mb-2 font-semibold text-foreground text-sm">
									Description
								</Text>
								<Text className="leading-6 text-muted-foreground">
									{bookmark.description}
								</Text>
							</View>
						)}

						{/* Tags */}
						{bookmark.tags && bookmark.tags.length > 0 && (
							<View>
								<Text className="mb-2 font-semibold text-foreground text-sm">
									Tags
								</Text>
								<View className="flex-row flex-wrap gap-2">
									{bookmark.tags.map((tag: string, index: number) => (
										<View
											key={`${tag}-${index}`}
											className="rounded-md bg-secondary px-2 py-1"
										>
											<Text className="text-secondary-foreground text-xs font-medium">
												{tag}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<View className="mt-6 gap-3">
					<Button onPress={handleOpenUrl} className="rounded-xl">
						<Icon as={ExternalLink} size={16} className="text-primary-foreground" />
						<Text>Open in Browser</Text>
					</Button>

					<Button
						onPress={handleCopyUrl}
						variant="outline"
						className="rounded-xl"
					>
						<Icon as={Copy} size={16} />
						<Text>Copy URL</Text>
					</Button>

					<Button
						onPress={handleDelete}
						variant="outline"
						className="rounded-xl border-destructive"
					>
						<Icon as={Trash2} size={16} className="text-destructive" />
						<Text className="text-destructive">Delete Bookmark</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
