import { useRouter } from "expo-router";
import { Rss } from "lucide-react-native";
import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { AddFeedModal } from "@/components/add-feed-modal";
import { RssArticleCardMobile } from "@/components/rss-article-card-mobile";
import { Icon } from "@/components/ui/icon";
import { useFeeds } from "@/hooks/use-feeds";

export default function RssScreen() {
	const router = useRouter();
	const {
		feeds,
		articles,
		addFeed,
		toggleArticleRead,
		toggleArticleLike,
		toggleArticleSave,
	} = useFeeds();

	// Sort articles by date
	const sortedArticles = useMemo(() => {
		return [...articles].sort(
			(a, b) =>
				new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
		);
	}, [articles]);

	const getFeedTitle = (feedId: string) => {
		return feeds.find((f) => f.id === feedId)?.title || "Unknown Feed";
	};

	const handleArticlePress = (articleId: string) => {
		router.push(`/article/${articleId}`);
	};

	return (
		<View className="flex-1 bg-background">
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
					contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
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
						<AddFeedModal
							onAddFeed={(data) => {
								addFeed({
									feedUrl: data.feedUrl,
									title: data.title || "New Feed",
								});
							}}
						/>
					</View>
				</View>
			)}
		</View>
	);
}
