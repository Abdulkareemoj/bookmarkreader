import { useCollectionsStore } from "@packages/store";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import {
	Bookmark,
	Clock,
	Compass,
	Flame,
	Image as ImageIcon,
	Pin,
	Plus,
	Rss,
	Tag,
	TrendingUp,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useReaderStore } from "@/lib/store";

export default function Home() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const refreshFeed = useReaderStore((state) => state.refreshFeed);
	const bookmarkCollections = useCollectionsStore(
		(state) => state.bookmarkCollections,
	);
	const [refreshing, setRefreshing] = useState(false);

	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const totalFeeds = feeds.length;

	const onRefresh = async () => {
		setRefreshing(true);
		// Refresh all feeds
		await Promise.all(feeds.map((feed) => refreshFeed(feed.id)));
		setRefreshing(false);
	};

	// Calculate total reading time for unread articles
	const totalReadingTime = articles
		.filter((a) => !a.read)
		.reduce((acc, a) => acc + (a.readTime || 0), 0);

	const dashboardData = [
		{
			title: "Total Bookmarks",
			value: totalBookmarks,
			icon: Bookmark,
			to: "/bookmarks",
			colorClass: "text-blue-500",
		},
		{
			title: "Unread Articles",
			value: unreadArticles,
			icon: Rss,
			to: "/rss",
			colorClass: "text-orange-500",
		},
		{
			title: "Reading Time",
			value: totalReadingTime,
			icon: Clock,
			to: "/rss",
			colorClass: "text-purple-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Compass,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

	// Time-based sections
	const today = new Date();
	const todayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	).toISOString();
	const weekAgo = new Date(
		today.getTime() - 7 * 24 * 60 * 60 * 1000,
	).toISOString();

	const bookmarksToday = bookmarks.filter((b) => b.createdAt >= todayStart);
	const articlesToday = articles.filter((a) => a.pubDate >= todayStart);
	const bookmarksThisWeek = bookmarks.filter((b) => b.createdAt >= weekAgo);
	const articlesThisWeek = articles.filter((a) => a.pubDate >= weekAgo);

	// Daily highlights - top articles by likes or recent
	const dailyHighlights = articles
		.filter((a) => !a.read)
		.sort((a, b) => {
			// Prioritize liked articles
			if (a.liked && !b.liked) return -1;
			if (!a.liked && b.liked) return 1;
			// Then by publication date
			return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
		})
		.slice(0, 3);

	// Trending articles - most liked this week
	const trendingArticles = articles
		.filter((a) => a.pubDate >= weekAgo && a.liked)
		.slice(0, 3);

	// Reading streak calculation
	const readDates = articles
		.filter((a) => a.read)
		.map((a) => new Date(a.pubDate).toDateString());
	const uniqueReadDates = Array.from(new Set(readDates));
	let currentStreak = 0;
	for (let i = 0; i < 7; i++) {
		const checkDate = new Date();
		checkDate.setDate(checkDate.getDate() - i);
		if (uniqueReadDates.indexOf(checkDate.toDateString()) !== -1) {
			currentStreak++;
		} else if (i > 0) {
			break;
		}
	}

	// Reading stats
	const readCount = articles.filter((a) => a.read).length;
	const savedCount = articles.filter((a) => a.saved).length;

	// Pinned items
	const pinnedItems = articles.filter((a) => a.saved).slice(0, 3);

	// Feed-specific sections
	const articlesByFeed = feeds.map((feed) => ({
		feed,
		articles: articles
			.filter((a) => a.feedId === feed.id && !a.read)
			.slice(0, 3),
	}));

	// Tag cloud
	const tagCounts: Record<string, number> = {};
	bookmarks.forEach((b) => {
		b.tags?.forEach((tag: string) => {
			tagCounts[tag] = (tagCounts[tag] || 0) + 1;
		});
	});
	const sortedTags = Object.keys(tagCounts)
		.map((key) => ({ tag: key, count: tagCounts[key] }))
		.filter((item) => typeof item.count === "number")
		.sort((a, b) => (b.count as number) - (a.count as number))
		.slice(0, 8);

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 28,
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<Stack.Screen
					options={{
						title: "Home",
					}}
				/>

				<Text className="mb-5 text-muted-foreground">
					A quick overview of your saved content and feeds.
				</Text>

				<View className="flex-row flex-wrap justify-between gap-4">
					{dashboardData.map((item) => (
						<View key={item.title} className="w-[48%]">
							<DashboardCardMobile {...item} />
						</View>
					))}
				</View>

				{/* Today's Activity */}
				{(bookmarksToday.length > 0 || articlesToday.length > 0) && (
					<View className="mt-7">
						<Card>
							<CardHeader>
								<CardTitle>Today's Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<Text className="text-muted-foreground text-sm">
									{bookmarksToday.length > 0 &&
										`${bookmarksToday.length} bookmark${bookmarksToday.length !== 1 ? "s" : ""} added`}
									{bookmarksToday.length > 0 &&
										articlesToday.length > 0 &&
										" • "}
									{articlesToday.length > 0 &&
										`${articlesToday.length} article${articlesToday.length !== 1 ? "s" : ""} published`}
								</Text>
							</CardContent>
						</Card>
					</View>
				)}

				{/* This Week */}
				{(bookmarksThisWeek.length > 0 || articlesThisWeek.length > 0) && (
					<View className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle>This Week</CardTitle>
							</CardHeader>
							<CardContent>
								<Text className="text-muted-foreground text-sm">
									{bookmarksThisWeek.length > 0 &&
										`${bookmarksThisWeek.length} bookmark${bookmarksThisWeek.length !== 1 ? "s" : ""}`}
									{bookmarksThisWeek.length > 0 &&
										articlesThisWeek.length > 0 &&
										" • "}
									{articlesThisWeek.length > 0 &&
										`${articlesThisWeek.length} article${articlesThisWeek.length !== 1 ? "s" : ""}`}
								</Text>
							</CardContent>
						</Card>
					</View>
				)}

				{/* Daily Highlights - Horizontal Scroll */}
				{dailyHighlights.length > 0 && (
					<View className="mt-7">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-lg">Daily Highlights</Text>
							<Flame size={18} className="text-orange-500" />
						</View>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 12 }}
						>
							{dailyHighlights.map((article) => {
								const feed = feeds.find((f) => f.id === article.feedId);
								return (
									<Pressable
										key={article.id}
										onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
										className="w-72 overflow-hidden rounded-lg border border-border bg-card"
									>
										{article.imageUrl ? (
											<Image
												source={{ uri: article.imageUrl }}
												className="h-32 w-full"
												contentFit="cover"
											/>
										) : (
											<View className="h-32 w-full items-center justify-center bg-muted/50">
												<View className="flex-col items-center gap-1">
													<Rss size={28} className="text-muted-foreground/60" />
													<Text className="text-muted-foreground/40 text-xs">
														No image
													</Text>
												</View>
											</View>
										)}

										<View className="p-3">
											{/* Category and read time */}
											<View className="mb-2 flex-row items-center gap-2">
												<View className="rounded-full bg-primary/10 px-2 py-1">
													<Text className="font-medium text-primary text-xs">
														{feed?.title || "RSS"}
													</Text>
												</View>
												<Text className="text-muted-foreground text-xs">
													{article.readTime || 5} min read
												</Text>
											</View>

											{/* Title */}
											<Text
												className="mb-1 font-semibold text-base"
												numberOfLines={2}
											>
												{article.title}
											</Text>

											{/* Excerpt */}
											<Text
												className="mb-2 text-muted-foreground text-xs"
												numberOfLines={2}
											>
												{article.contentSnippet || article.content || ""}
											</Text>

											{/* Footer */}
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center gap-2">
													{feed?.siteUrl ? (
														<Image
															source={{
																uri: `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`,
															}}
															className="h-5 w-5 rounded-full"
															contentFit="cover"
														/>
													) : (
														<View className="h-5 w-5 items-center justify-center rounded-full bg-primary/20">
															<Text className="font-medium text-[8px] text-primary">
																{(feed?.title || "U").charAt(0).toUpperCase()}
															</Text>
														</View>
													)}
													<View>
														<Text className="font-medium text-foreground text-xs">
															{feed?.title || "Unknown"}
														</Text>
														<Text className="text-muted-foreground text-xs">
															{article.pubDate
																? new Date(article.pubDate).toLocaleDateString()
																: ""}
														</Text>
													</View>
												</View>
											</View>
										</View>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				)}

				{/* Trending Articles - Horizontal Scroll */}
				{trendingArticles.length > 0 && (
					<View className="mt-7">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-lg">Trending This Week</Text>
							<TrendingUp size={18} className="text-green-500" />
						</View>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 12 }}
						>
							{trendingArticles.map((article) => {
								const feed = feeds.find((f) => f.id === article.feedId);
								return (
									<Pressable
										key={article.id}
										onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
										className="w-72 overflow-hidden rounded-lg border border-border bg-card"
									>
										{/* Image */}
										{article.imageUrl ? (
											<Image
												source={{ uri: article.imageUrl }}
												className="h-32 w-full"
												contentFit="cover"
											/>
										) : (
											<View className="h-32 w-full items-center justify-center bg-muted/50">
												<View className="flex-col items-center gap-1">
													<Rss size={28} className="text-muted-foreground/60" />
													<Text className="text-muted-foreground/40 text-xs">
														No image
													</Text>
												</View>
											</View>
										)}

										<View className="p-3">
											{/* Category and read time */}
											<View className="mb-2 flex-row items-center gap-2">
												<View className="rounded-full bg-primary/10 px-2 py-1">
													<Text className="font-medium text-primary text-xs">
														{feed?.title || "RSS"}
													</Text>
												</View>
												<Text className="text-muted-foreground text-xs">
													{article.readTime || 5} min read
												</Text>
											</View>

											{/* Title */}
											<Text
												className="mb-1 font-semibold text-base"
												numberOfLines={2}
											>
												{article.title}
											</Text>

											{/* Excerpt */}
											<Text
												className="mb-2 text-muted-foreground text-xs"
												numberOfLines={2}
											>
												{article.contentSnippet || article.content || ""}
											</Text>

											{/* Footer */}
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center gap-2">
													{feed?.siteUrl ? (
														<Image
															source={{
																uri: `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`,
															}}
															className="h-5 w-5 rounded-full"
															contentFit="cover"
														/>
													) : (
														<View className="h-5 w-5 items-center justify-center rounded-full bg-primary/20">
															<Text className="font-medium text-[8px] text-primary">
																{(feed?.title || "U").charAt(0).toUpperCase()}
															</Text>
														</View>
													)}
													<View>
														<Text className="font-medium text-foreground text-xs">
															{feed?.title || "Unknown"}
														</Text>
														<Text className="text-muted-foreground text-xs">
															{article.pubDate
																? new Date(article.pubDate).toLocaleDateString()
																: ""}
														</Text>
													</View>
												</View>
											</View>
										</View>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				)}

				{/* Reading Streak */}
				{currentStreak > 0 && (
					<View className="mt-7">
						<Card>
							<CardHeader>
								<View className="flex-row items-center gap-2">
									<Flame size={20} className="text-orange-500" />
									<CardTitle>Reading Streak</CardTitle>
								</View>
							</CardHeader>
							<CardContent>
								<Text className="font-bold text-2xl text-primary">
									{currentStreak} day{currentStreak !== 1 ? "s" : ""}
								</Text>
								<Text className="text-muted-foreground text-sm">
									Keep up the great work!
								</Text>
							</CardContent>
						</Card>
					</View>
				)}

				{/* Reading Stats */}
				<View className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Reading Stats</CardTitle>
						</CardHeader>
						<CardContent>
							<View className="flex-row justify-between">
								<View>
									<Text className="font-bold text-2xl text-primary">
										{readCount}
									</Text>
									<Text className="text-muted-foreground text-xs">Read</Text>
								</View>
								<View>
									<Text className="font-bold text-2xl text-primary">
										{savedCount}
									</Text>
									<Text className="text-muted-foreground text-xs">Saved</Text>
								</View>
								<View>
									<Text className="font-bold text-2xl text-primary">
										{unreadArticles}
									</Text>
									<Text className="text-muted-foreground text-xs">Unread</Text>
								</View>
							</View>
						</CardContent>
					</Card>
				</View>

				{/* Pinned Items - Horizontal Scroll */}
				{pinnedItems.length > 0 && (
					<View className="mt-7">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-lg">Pinned Items</Text>
							<Pin size={18} className="text-blue-500" />
						</View>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 12 }}
						>
							{pinnedItems.map((article) => {
								const feed = feeds.find((f) => f.id === article.feedId);
								return (
									<Pressable
										key={article.id}
										onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
										className="w-72 overflow-hidden rounded-lg border border-border bg-card"
									>
										{/* Image */}
										{article.imageUrl ? (
											<Image
												source={{ uri: article.imageUrl }}
												className="h-32 w-full"
												contentFit="cover"
											/>
										) : (
											<View className="h-32 w-full items-center justify-center bg-muted/50">
												<View className="flex-col items-center gap-1">
													<Rss size={28} className="text-muted-foreground/60" />
													<Text className="text-muted-foreground/40 text-xs">
														No image
													</Text>
												</View>
											</View>
										)}

										<View className="p-3">
											{/* Category and read time */}
											<View className="mb-2 flex-row items-center gap-2">
												<View className="rounded-full bg-primary/10 px-2 py-1">
													<Text className="font-medium text-primary text-xs">
														{feed?.title || "RSS"}
													</Text>
												</View>
												<Text className="text-muted-foreground text-xs">
													{article.readTime || 5} min read
												</Text>
											</View>

											{/* Title */}
											<Text
												className="mb-1 font-semibold text-base"
												numberOfLines={2}
											>
												{article.title}
											</Text>

											{/* Excerpt */}
											<Text
												className="mb-2 text-muted-foreground text-xs"
												numberOfLines={2}
											>
												{article.contentSnippet || article.content || ""}
											</Text>

											{/* Footer */}
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center gap-2">
													{feed?.siteUrl ? (
														<Image
															source={{
																uri: `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`,
															}}
															className="h-5 w-5 rounded-full"
															contentFit="cover"
														/>
													) : (
														<View className="h-5 w-5 items-center justify-center rounded-full bg-primary/20">
															<Text className="font-medium text-[8px] text-primary">
																{(feed?.title || "U").charAt(0).toUpperCase()}
															</Text>
														</View>
													)}
													<View>
														<Text className="font-medium text-foreground text-xs">
															{feed?.title || "Unknown"}
														</Text>
														<Text className="text-muted-foreground text-xs">
															{article.pubDate
																? new Date(article.pubDate).toLocaleDateString()
																: ""}
														</Text>
													</View>
												</View>
											</View>
										</View>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				)}

				{/* Feed-specific Sections - Horizontal Scroll */}
				{articlesByFeed.some((f) => f.articles.length > 0) && (
					<View className="mt-7">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-lg">From Your Feeds</Text>
							<Rss size={18} className="text-purple-500" />
						</View>
						{articlesByFeed.map(({ feed, articles: feedArticles }) =>
							feedArticles.length > 0 ? (
								<View key={feed.id} className="mb-4">
									<Text className="mb-2 font-semibold text-sm">
										{feed.title}
									</Text>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ gap: 12 }}
									>
										{feedArticles.map((article) => (
											<Pressable
												key={article.id}
												onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
												className="w-72 overflow-hidden rounded-lg border border-border bg-card"
											>
												{/* Image */}
												

												<View className="p-3">
													{/* Category and read time */}
													<View className="mb-2 flex-row items-center gap-2">
														<View className="rounded-full bg-primary/10 px-2 py-1">
															<Text className="font-medium text-primary text-xs">
																{feed.title}
															</Text>
														</View>
														<Text className="text-muted-foreground text-xs">
															{article.readTime || 5} min read
														</Text>
													</View>

													{/* Title */}
													<Text
														className="mb-1 font-semibold text-base"
														numberOfLines={2}
													>
														{article.title}
													</Text>

													{/* Excerpt */}
													<Text
														className="mb-2 text-muted-foreground text-xs"
														numberOfLines={2}
													>
														{article.contentSnippet || article.content || ""}
													</Text>

													{/* Footer */}
																							<View className="flex-row items-center justify-between">
												<View className="flex-row items-center gap-2">
													{feed?.siteUrl ? (
														<Image
															source={{
																uri: `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`,
															}}
															className="h-5 w-5 rounded-full"
															contentFit="cover"
														/>
													) : (
														<View className="h-5 w-5 items-center justify-center rounded-full bg-primary/20">
															<Text className="font-medium text-[8px] text-primary">
																{(feed?.title || "U").charAt(0).toUpperCase()}
															</Text>
														</View>
													)}
													<View>
														<Text className="font-medium text-foreground text-xs">
															{feed?.title || "Unknown"}
														</Text>
														<Text className="text-muted-foreground text-xs">
															{article.pubDate
																? new Date(article.pubDate).toLocaleDateString()
																: ""}
														</Text>
													</View>
												</View>
											</View>
												</View>
											</Pressable>
										))}
									</ScrollView>
								</View>
							) : null,
						)}
					</View>
				)}

				{/* Tag Cloud */}
				{sortedTags.length > 0 && (
					<View className="mt-7">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-lg">Popular Tags</Text>
							<Tag size={18} className="text-blue-500" />
						</View>
						<View className="flex flex-wrap gap-2">
							{sortedTags.map(({ tag, count }) => (
								<View
									key={tag}
									className="rounded-full bg-secondary px-3 py-1.5"
								>
									<Text className="font-medium text-secondary-foreground text-xs">
										{tag} ({count})
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Collections */}
				{bookmarkCollections.length > 2 && (
					<View className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle>Collections</CardTitle>
							</CardHeader>
							<CardContent>
								<View className="flex flex-wrap gap-2">
									{bookmarkCollections.slice(0, 4).map((collection) => (
										<View
											key={collection.id}
											className="rounded-full bg-secondary px-3 py-1.5"
										>
											<Text className="font-medium text-secondary-foreground text-xs">
												{collection.name}
											</Text>
										</View>
									))}
									{bookmarkCollections.length > 4 && (
										<View className="rounded-full bg-muted px-3 py-1.5">
											<Text className="font-medium text-muted-foreground text-xs">
												+{bookmarkCollections.length - 4} more
											</Text>
										</View>
									)}
								</View>
							</CardContent>
						</Card>
					</View>
				)}

				<View className="mt-7">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent className="">
							<Text className="text-muted-foreground text-sm">
								{totalBookmarks === 0 && totalFeeds === 0
									? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
									: `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
							</Text>
						</CardContent>
					</Card>
				</View>
			</ScrollView>

			{/* FAB for quick actions */}
			<View className="absolute right-6 bottom-6">
				<Pressable
					className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
					onPress={() => {
						// TODO: Open quick action menu (add bookmark, add feed)
						console.log("Quick action pressed");
					}}
				>
					<Plus size={24} className="text-primary-foreground" />
				</Pressable>
			</View>
		</View>
	);
}
