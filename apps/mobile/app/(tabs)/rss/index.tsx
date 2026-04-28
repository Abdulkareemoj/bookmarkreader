import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { BookMarked, Check, Filter, Rss, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { AddFeedModal } from "@/components/add-feed-modal";
import { RssArticleCardMobile } from "@/components/rss-article-card-mobile";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useFeeds } from "@/hooks/use-feeds";

export default function RssScreen() {
	const router = useRouter();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["55%", "78%"], []);
	const {
		feeds,
		articles,
		addFeed,
		toggleArticleRead,
		toggleArticleLike,
		toggleArticleSave,
		refreshFeed,
	} = useFeeds();

	const [sortBy, setSortBy] = useState<"Latest" | "Oldest" | "Unread" | "Liked" | "Source">("Latest");
	const [showBottomSheet, setShowBottomSheet] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const handleSheetChanges = useCallback((index: number) => {
		if (index === -1) {
			setShowBottomSheet(false);
		}
	}, []);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			// Refresh all feeds individually to handle failures gracefully
			const refreshPromises = feeds.map(async (feed) => {
				try {
					await refreshFeed(feed.id);
				} catch (error) {
					console.error(`Failed to refresh feed ${feed.title || feed.id}:`, error);
					// Continue with other feeds even if this one fails
				}
			});
			await Promise.all(refreshPromises);
		} catch (error) {
			console.error("Failed to refresh feeds:", error);
		} finally {
			setRefreshing(false);
		}
	}, [feeds, refreshFeed]);

	useEffect(() => {
		if (showBottomSheet) {
			requestAnimationFrame(() => {
				bottomSheetRef.current?.snapToIndex(0);
			});
		} else {
			bottomSheetRef.current?.close();
		}
	}, [showBottomSheet]);

	// Sort articles based on selected option
	const sortedArticles = useMemo(() => {
		const sorted = [...articles];
		
		switch (sortBy) {
			case "Latest":
				return sorted.sort(
					(a, b) =>
						new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
				);
			case "Oldest":
				return sorted.sort(
					(a, b) =>
						new Date(a.pubDate || 0).getTime() - new Date(b.pubDate || 0).getTime(),
				);
			case "Unread":
				return sorted.sort((a, b) => {
					// Unread articles first, then by date
					if (a.read !== b.read) {
						return a.read ? 1 : -1;
					}
					return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
				});
			case "Liked":
				return sorted.sort((a, b) => {
					// Liked articles first, then by date
					if (a.liked !== b.liked) {
						return b.liked ? 1 : -1;
					}
					return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
				});
			case "Source":
				return sorted.sort((a, b) => {
					const feedA = feeds.find((f) => f.id === a.feedId);
					const feedB = feeds.find((f) => f.id === b.feedId);
					const titleA = feedA?.title || "Unknown Feed";
					const titleB = feedB?.title || "Unknown Feed";
					
					// Sort by feed title first, then by date
					if (titleA !== titleB) {
						return titleA.localeCompare(titleB);
					}
					return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
				});
			default:
				return sorted;
		}
	}, [articles, sortBy, feeds]);

	const getFeedTitle = (feedId: string) => {
		return feeds.find((f) => f.id === feedId)?.title || "Unknown Feed";
	};

	const handleArticlePress = useCallback((articleId: string) => {
		router.push(`/rss/${articleId}` as any);
	}, [router]);

	return (
		<View className="flex-1 bg-background pt-4">
			{/* Header with Filter Button */}
			<View className="flex-row items-center justify-between px-4 pb-3">
  <Text className="font-medium text-foreground">
    {sortedArticles.length} articles
  </Text>
  <View className="flex-row items-center gap-2">
    <Pressable
      onPress={() => router.push("/rss/sources" as any)}
      className="flex-row items-center gap-2 rounded-xl bg-secondary px-3 py-2 active:opacity-80"
    >
      <BookMarked size={16} className="text-secondary-foreground" />
      <Text className="text-secondary-foreground text-sm font-medium">
        Sources
      </Text>
    </Pressable>
    <Pressable
      onPress={() => setShowBottomSheet(true)}
      className="flex-row items-center gap-2 rounded-xl bg-secondary px-3 py-2 active:opacity-80"
    >
      <Filter size={16} className="text-secondary-foreground" />
      <Text className="text-secondary-foreground text-sm font-medium">
        {sortBy}
      </Text>
    </Pressable>
  </View>
</View>
			{sortedArticles.length > 0 ? (
				<FlatList
					data={sortedArticles}
					renderItem={({ item }) => (
						<RssArticleCardMobile
							article={item}
							feedTitle={getFeedTitle(item.feedId)}
							onToggleRead={toggleArticleRead}
							onToggleLike={toggleArticleLike}
							onToggleSave={toggleArticleSave}
							onPress={() => handleArticlePress(item.id)}
						/>
					)}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor="#6b7280"
						/>
					}
				/>
			) : (
				<View className="flex-1 items-center justify-center p-8">
					<Icon as={Rss} size={48} className="mb-4 text-muted-foreground" />
					<Text className="mb-2 font-semibold text-lg text-muted-foreground">
						No Articles Found
					</Text>
					<Text className="text-center text-muted-foreground text-sm">
						Subscribe to an RSS feed to start reading articles.
					</Text>
					<View className="p-4">
						<Pressable
							onPress={() => setShowBottomSheet(true)}
							className="rounded-xl bg-primary px-4 py-3 active:opacity-70"
						>
							<Text className="text-primary-foreground text-center font-medium">
								Add Feed
							</Text>
						</Pressable>
					</View>
				</View>
			)}

			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				snapPoints={snapPoints}
				enablePanDownToClose
				onChange={handleSheetChanges}
				backgroundStyle={{ backgroundColor: "hsl(var(--background))" }}
				handleIndicatorStyle={{ backgroundColor: "hsl(var(--muted-foreground))" }}
			>
				<BottomSheetView className="flex-1 px-5 pb-6">
					<View className="mb-5 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground text-xl">RSS Controls</Text>
						<Pressable
							onPress={() => setShowBottomSheet(false)}
							className="rounded-full bg-accent p-2 active:opacity-80"
						>
							<X size={20} className="text-muted-foreground" />
						</Pressable>
					</View>

					<View className="mb-6 gap-2">
						<Text className="mb-1 font-medium text-foreground">Sort Articles</Text>
						{[
							{ key: "newest", label: "Newest First" },
							{ key: "oldest", label: "Oldest First" },
							{ key: "unread", label: "Unread First" },
							{ key: "liked", label: "Liked First" },
							{ key: "source", label: "By Source" },
						].map((option) => (
							<Pressable
								key={option.key}
								onPress={() => {
									setSortBy(option.key as typeof sortBy);
									setShowBottomSheet(false);
								}}
								className={`flex-row items-center justify-between rounded-xl border px-4 py-3 active:opacity-80 ${
									sortBy === option.key
										? "border-primary/30 bg-primary/10"
										: "border-border bg-muted/40"
								}`}
							>
								<Text className="font-medium text-foreground">{option.label}</Text>
								{sortBy === option.key ? (
									<Icon as={Check} size={18} className="text-primary" />
								) : null}
							</Pressable>
						))}
					</View>

					<View>
						<Text className="mb-3 font-medium text-foreground">Add New Feed</Text>
						<AddFeedModal
							onAddFeed={(data) => {
								console.log("[RssPage] Adding feed:", data);
								addFeed({
									feedUrl: data.feedUrl,
									title: data.title || "New Feed",
								});
								setShowBottomSheet(false);
							}}
						/>
					</View>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
