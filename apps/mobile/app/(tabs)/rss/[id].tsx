

import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Heart, Share2 } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFeeds } from "@/hooks/use-feeds";

export default function ArticleScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { articles, feeds, toggleArticleLike, toggleArticleSave, toggleArticleRead } = useFeeds();

	const article = articles.find((a) => a.id === id);
	const feed = feeds.find((f) => f.id === article?.feedId);

	if (!article) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-muted-foreground">Article not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Mark as read when opened
	React.useEffect(() => {
		if (!article.read) {
			toggleArticleRead(article.id);
		}
	}, [article.id, article.read, toggleArticleRead]);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between border-border border-b px-4 py-3">
				<TouchableOpacity onPress={() => router.back()}>
					<ArrowLeft size={24} className="text-foreground" />
				</TouchableOpacity>
				<View className="flex-row gap-3">
					<TouchableOpacity onPress={() => toggleArticleLike(article.id)}>
						<Heart
							size={24}
							className={article.liked ? "text-red-500" : "text-muted-foreground"}
							fill={article.liked ? "#ef4444" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => toggleArticleSave(article.id)}>
						<Bookmark
							size={24}
							className={article.saved ? "text-blue-500" : "text-muted-foreground"}
							fill={article.saved ? "#3b82f6" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity>
						<Share2 size={24} className="text-muted-foreground" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-4 py-4">
				{/* Title */}
				<Text className="mb-3 font-bold text-3xl text-foreground">
					{article.title}
				</Text>

				{/* Metadata */}
				<View className="mb-4 flex-row items-center justify-between border-border border-b pb-4">
					<View>
						<Text className="font-medium text-foreground text-sm">
							{feed?.title || "Unknown Feed"}
						</Text>
						<Text className="mt-1 text-muted-foreground text-xs">
							{new Date(article.pubDate || 0).toLocaleDateString()}
						</Text>
					</View>
					<View className="rounded-full bg-primary/10 px-3 py-1">
						<Text className="font-medium text-primary text-xs">
							{Math.ceil((article.content?.length || 0) / 1000)} min read
						</Text>
					</View>
				</View>

				{/* Article Content */}
				<Text className="text-base text-foreground leading-7">
					{article.content || article.summary || "No content available"}
				</Text>

				{/* Feed Tag */}
				<View className="mt-6 border-border border-t pt-4">
					<View className="w-fit rounded-full bg-muted px-3 py-1">
						<Text className="font-medium text-muted-foreground text-xs">
							{feed?.title || "RSS Feed"}
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
