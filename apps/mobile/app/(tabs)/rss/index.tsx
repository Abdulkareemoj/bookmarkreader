import { useRouter } from "expo-router";
import { ArrowUpDown, Filter, Plus, Rss, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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

	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "unread" | "liked" | "source">("newest");
	const [showBottomSheet, setShowBottomSheet] = useState(false);

	// Sort articles based on selected option
	const sortedArticles = useMemo(() => {
		const sorted = [...articles];
		
		switch (sortBy) {
			case "newest":
				return sorted.sort(
					(a, b) =>
						new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
				);
			case "oldest":
				return sorted.sort(
					(a, b) =>
						new Date(a.pubDate || 0).getTime() - new Date(b.pubDate || 0).getTime(),
				);
			case "unread":
				return sorted.sort((a, b) => {
					// Unread articles first, then by date
					if (a.read !== b.read) {
						return a.read ? 1 : -1;
					}
					return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
				});
			case "liked":
				return sorted.sort((a, b) => {
					// Liked articles first, then by date
					if (a.liked !== b.liked) {
						return b.liked ? 1 : -1;
					}
					return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
				});
			case "source":
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

	const handleArticlePress = (articleId: string) => {
		router.push(`/rss/${articleId}` as any);
	};

	return (
		<View className="flex-1 bg-background pt-4">
			{/* Header with Filter Button */}
			<View className="flex-row items-center justify-between px-4 pb-3">
				<Text className="font-medium text-foreground">
					{sortedArticles.length} articles
				</Text>
				<TouchableOpacity
					onPress={() => setShowBottomSheet(true)}
					className="flex-row items-center gap-2 rounded-lg bg-secondary px-3 py-2"
				>
					<Filter size={16} className="text-secondary-foreground" />
					<Text className="text-secondary-foreground text-sm font-medium">
						{sortBy}
					</Text>
				</TouchableOpacity>
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
						<TouchableOpacity
							onPress={() => setShowBottomSheet(true)}
							className="rounded-lg bg-primary px-4 py-3 active:opacity-70"
						>
							<Text className="text-primary-foreground text-center font-medium">
								Add Feed
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Bottom Sheet */}
			{showBottomSheet && (
				<View className="absolute inset-0 bg-black/50" style={{ zIndex: 1000 }}>
					<TouchableOpacity
						className="flex-1"
						onPress={() => setShowBottomSheet(false)}
						activeOpacity={1}
					/>
					<View className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6">
						{/* Handle */}
						<View className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
						
						{/* Header */}
						<View className="flex-row items-center justify-between mb-6">
							<Text className="font-semibold text-foreground text-lg">RSS Controls</Text>
							<TouchableOpacity onPress={() => setShowBottomSheet(false)}>
								<X size={24} className="text-muted-foreground" />
							</TouchableOpacity>
						</View>

						{/* Sorting Options */}
						<View className="mb-6">
							<Text className="font-medium text-foreground mb-3">Sort Articles</Text>
							<View className="space-y-2">
								{[
									{ key: "newest", label: "Newest First", icon: "📅" },
									{ key: "oldest", label: "Oldest First", icon: "📜" },
									{ key: "unread", label: "Unread First", icon: "📖" },
									{ key: "liked", label: "Liked First", icon: "❤️" },
									{ key: "source", label: "By Source", icon: "📡" },
								].map((option) => (
									<TouchableOpacity
										key={option.key}
										onPress={() => {
											setSortBy(option.key as any);
											setShowBottomSheet(false);
										}}
										className={`flex-row items-center justify-between rounded-lg p-3 ${
											sortBy === option.key ? "bg-secondary" : "bg-muted/50"
										}`}
									>
										<View className="flex-row items-center gap-3">
											<Text className="text-lg">{option.icon}</Text>
											<Text className="text-foreground font-medium">{option.label}</Text>
										</View>
										{sortBy === option.key && (
											<View className="w-2 h-2 bg-primary rounded-full" />
										)}
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Add Feed Section */}
						<View>
							<Text className="font-medium text-foreground mb-3">Add New Feed</Text>
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
					</View>
				</View>
			)}
		</View>
	);
}
