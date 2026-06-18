import { Image } from "expo-image";
import { router } from "expo-router";
import {
	Bookmark,
	BookOpen,
	Film,
	Heart,
	Plus,
	Rss,
	Shuffle,
	TrendingUp,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	curatedFeedsByCategory,
	getAllCuratedFeeds,
	getCategories,
	getRandomFeeds,
	discoverYouTubeChannelFeed,
	parseYouTubeChannelUrl,
} from "@packages/utils";
import { useReaderStore } from "@/lib/store";

function SmallArticleCard({ articleId }: { articleId: string }) {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const article = articles.find((a) => a.id === articleId);
	if (!article) return null;
	const feed = feeds.find((f) => f.id === article.feedId);

	return (
		<Pressable
			onPress={() => router.push(`/(tabs)/rss/${article.id}`)}
			className="mb-2 overflow-hidden rounded-xl border border-border bg-card"
		>
			{article.imageUrl && (
				<Image
					source={{ uri: article.imageUrl }}
					className="h-28 w-full"
					contentFit="cover"
				/>
			)}
			<View className="p-3">
				<View className="mb-1 flex-row items-center gap-2">
					<View className="rounded-full bg-primary/10 px-2 py-0.5">
						<Text className="text-primary text-[10px] font-medium">
							{feed?.title || "RSS"}
						</Text>
					</View>
					<Text className="text-muted-foreground text-[10px]">
						{article.readTime || 3} min
					</Text>
				</View>
				<Text className="font-semibold text-sm" numberOfLines={2}>
					{article.title}
				</Text>
				<Text className="mt-1 text-muted-foreground text-xs" numberOfLines={2}>
					{article.contentSnippet || article.content || ""}
				</Text>
			</View>
		</Pressable>
	);
}

function EmptyCard({
	title,
	desc,
	action,
}: {
	title: string;
	desc: string;
	action?: { label: string; onPress: () => void };
}) {
	return (
		<View className="flex flex-col items-center justify-center gap-2 py-10">
			<View className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40">
				<Rss size={16} className="text-muted-foreground" />
			</View>
			<Text className="text-center font-medium text-foreground text-sm">
				{title}
			</Text>
			<Text className="max-w-[240px] text-center text-muted-foreground text-sm leading-relaxed">
				{desc}
			</Text>
			{action && (
				<TouchableOpacity
					onPress={action.onPress}
					className="mt-2 rounded-lg bg-primary px-4 py-2 active:opacity-70"
				>
					<Text className="font-medium text-primary-foreground text-sm">
						{action.label}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

export default function Explore() {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const addFeed = useReaderStore((state) => state.addFeed);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [youtubeLoading, setYoutubeLoading] = useState(false);
	const [youtubeError, setYoutubeError] = useState("");
	const [randomFeeds, setRandomFeeds] = useState(getRandomFeeds(6));
	const [selectedCategory, setSelectedCategory] = useState<string | "all">(
		"all",
	);

	const readArticles = articles.filter((a) => a.read).length;
	const likedArticlesCount = articles.filter((a) => a.liked).length;
	const savedArticlesCount = articles.filter((a) => a.saved).length;
	const totalArticles = articles.length;

	const stats = [
		{
			icon: BookOpen,
			label: "Articles read",
			value: readArticles,
			to: "/rss",
			colorClass: "text-blue-500",
		},
		{
			icon: Heart,
			label: "Articles liked",
			value: likedArticlesCount,
			to: "/rss",
			colorClass: "text-red-500",
		},
		{
			icon: Bookmark,
			label: "Articles saved",
			value: savedArticlesCount,
			to: "/bookmarks",
			colorClass: "text-green-500",
		},
		{
			icon: Rss,
			label: "Total articles",
			value: totalArticles,
			to: "/rss",
			colorClass: "text-purple-500",
		},
	];

	const bestArticleIds = articles
		.filter((a) => !a.read)
		.sort(
			(a, b) =>
				new Date(b.pubDate || 0).getTime() -
				new Date(a.pubDate || 0).getTime(),
		)
		.slice(0, 4)
		.map((a) => a.id);

	const recommendedIds = articles
		.filter((a) => a.liked)
		.slice(0, 4)
		.map((a) => a.id);

	const backlogIds = articles
		.filter((a) => a.saved && !a.read)
		.slice(0, 4)
		.map((a) => a.id);

	const categories = getCategories();

	const filteredFeeds =
		selectedCategory === "all"
			? getAllCuratedFeeds()
			: curatedFeedsByCategory[selectedCategory] || [];

	const handleAddFeed = async (url: string, title: string) => {
		try {
			await addFeed({ feedUrl: url, title });
		} catch (e) {
			console.error("Failed to add feed:", e);
		}
	};

	const handleRandomFeeds = () => {
		setRandomFeeds(getRandomFeeds(6));
	};

	const handleYouTubeSubscribe = async () => {
		setYoutubeError("");
		const { normalizedUrl, isValid } = parseYouTubeChannelUrl(youtubeUrl);
		if (!isValid || !normalizedUrl) {
			setYoutubeError("Invalid YouTube channel URL");
			return;
		}
		setYoutubeLoading(true);
		try {
			const result = await discoverYouTubeChannelFeed(
				normalizedUrl,
				async (url) => {
					const res = await fetch(url);
					return res.text();
				},
			);
			if (!result) {
				setYoutubeError("Could not find RSS feed for this channel");
				return;
			}
			await handleAddFeed(result.feedUrl, result.title);
			setYoutubeUrl("");
		} catch {
			setYoutubeError("Failed to subscribe. Try the URL directly.");
		} finally {
			setYoutubeLoading(false);
		}
	};

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingTop: 16,
				paddingBottom: 28,
			}}
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			<Text className="mb-5 text-muted-foreground">
				Discover content and insights from your reading patterns.
			</Text>

			<View className="pb-2">
				<View className="flex-row flex-wrap gap-3">
					{stats.map((s) => (
						<View key={s.label} className="w-[48%]">
							<DashboardCardMobile
								title={s.label}
								value={s.value}
								icon={s.icon}
								to={s.to}
								colorClass={s.colorClass}
							/>
						</View>
					))}
				</View>
			</View>

			<View className="gap-4 pt-3">
				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<Rss size={16} className="text-primary" />
							<CardTitle>Best of your feeds</CardTitle>
						</View>
						<CardDescription>
							Latest unread articles across all sources
						</CardDescription>
					</CardHeader>
					<CardContent>
						{bestArticleIds.length > 0 ? (
							bestArticleIds.map((id) => (
								<SmallArticleCard key={id} articleId={id} />
							))
						) : (
							<EmptyCard
								title="No feeds yet"
								desc="Add some feeds to see articles here"
								action={{
									label: "Add feed",
									onPress: () => router.push("/(tabs)/rss/sources"),
								}}
							/>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<TrendingUp size={16} className="text-primary" />
							<CardTitle>Read more like this</CardTitle>
						</View>
						<CardDescription>
							Personalised recommendations from your activity
						</CardDescription>
					</CardHeader>
					<CardContent>
						{recommendedIds.length > 0 ? (
							recommendedIds.map((id) => (
								<SmallArticleCard key={id} articleId={id} />
							))
						) : (
							<EmptyCard
								title="Nothing yet"
								desc="Like some articles to get personalised recommendations"
							/>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<Bookmark size={16} className="text-primary" />
							<CardTitle>Your backlog</CardTitle>
						</View>
						<CardDescription>
							Saved articles you haven't read yet
						</CardDescription>
					</CardHeader>
					<CardContent>
						{backlogIds.length > 0 ? (
							backlogIds.map((id) => (
								<SmallArticleCard key={id} articleId={id} />
							))
						) : (
							<EmptyCard
								title="All caught up"
								desc="No unread saved articles — you're on top of it"
							/>
						)}
					</CardContent>
				</Card>

				{/* YouTube Subscription */}
				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<Film size={16} className="text-red-500" />
							<CardTitle>Subscribe to YouTube Channels</CardTitle>
						</View>
						<CardDescription>
							Enter a YouTube channel URL or handle to subscribe via RSS
						</CardDescription>
					</CardHeader>
					<CardContent>
						<View className="gap-2">
							<Input
								placeholder="e.g. https://youtube.com/@mkbhd"
								value={youtubeUrl}
								onChangeText={(text) => {
									setYoutubeUrl(text);
									setYoutubeError("");
								}}
								returnKeyType="done"
								onSubmitEditing={handleYouTubeSubscribe}
							/>
							<TouchableOpacity
								onPress={handleYouTubeSubscribe}
								disabled={youtubeLoading || !youtubeUrl.trim()}
								className={`rounded-lg px-4 py-2.5 ${
									youtubeLoading || !youtubeUrl.trim()
										? "bg-muted"
										: "bg-red-500 active:opacity-80"
								}`}
							>
								<Text
									className={`text-center text-sm font-medium ${
										youtubeLoading || !youtubeUrl.trim()
											? "text-muted-foreground"
											: "text-white"
									}`}
								>
									{youtubeLoading ? "Discovering..." : "Subscribe"}
								</Text>
							</TouchableOpacity>
							{youtubeError ? (
								<Text className="text-red-500 text-xs">{youtubeError}</Text>
							) : null}
							<Text className="text-muted-foreground text-xs">
								Supports youtube.com/channel/UC..., youtube.com/@handle, or
								bare @handle
							</Text>
						</View>
					</CardContent>
				</Card>

				{/* Surprise Me */}
				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<Shuffle size={16} className="text-primary" />
							<CardTitle>Surprise Me</CardTitle>
						</View>
						<CardDescription>
							Not sure what to follow? Try a random pick
						</CardDescription>
					</CardHeader>
					<CardContent>
						{randomFeeds.map((feed) => {
							const alreadySubscribed = feeds.some(
								(f) => f.feedUrl === feed.url,
							);
							return (
								<View
									key={feed.name}
									className="mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
								>
									<View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
										<Text className="text-sm">{feed.icon}</Text>
									</View>
									<View className="flex-1">
										<View className="flex-row items-center gap-2">
											<Text className="flex-1 font-medium text-foreground text-sm">
												{feed.name}
											</Text>
											<View className="rounded-full bg-secondary px-2 py-0.5">
												<Text className="text-secondary-foreground text-[10px] font-medium">
													{feed.category}
												</Text>
											</View>
										</View>
										<Text className="mt-0.5 text-muted-foreground text-sm">
											{feed.description}
										</Text>
									</View>
									<Pressable
										className={`h-8 w-8 items-center justify-center rounded-lg border ${
											alreadySubscribed
												? "border-border bg-muted/40 opacity-50"
												: "border-border bg-muted/40 active:opacity-80"
										}`}
										disabled={alreadySubscribed}
										onPress={() => handleAddFeed(feed.url, feed.name)}
									>
										<Icon
											as={Plus}
											size={16}
											className="text-muted-foreground"
										/>
									</Pressable>
								</View>
							);
						})}
						<TouchableOpacity
							onPress={handleRandomFeeds}
							className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-border py-2.5"
						>
							<Shuffle size={16} className="text-muted-foreground" />
							<Text className="text-muted-foreground text-sm font-medium">
								Shuffle
							</Text>
						</TouchableOpacity>
					</CardContent>
				</Card>

				{/* Feed Directory */}
				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<TrendingUp size={16} className="text-primary" />
							<CardTitle>Feed Directory</CardTitle>
						</View>
						<CardDescription>
							Browse curated sources worth following
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs
							value={selectedCategory}
							onValueChange={(v) => setSelectedCategory(v)}
						>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								className="mb-4"
							>
								<TabsList>
									<TabsTrigger value="all">
										<Text className="text-xs font-medium">All</Text>
									</TabsTrigger>
									{categories.map((cat) => (
										<TabsTrigger key={cat} value={cat}>
											<Text className="text-xs font-medium">{cat}</Text>
										</TabsTrigger>
									))}
								</TabsList>
							</ScrollView>

							<TabsContent value={selectedCategory}>
								<View className="gap-2">
									{filteredFeeds.map((feed) => {
										const alreadySubscribed = feeds.some(
											(f) => f.feedUrl === feed.url,
										);
										return (
											<View
												key={feed.name}
												className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
											>
												<View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
													<Text className="text-sm">{feed.icon}</Text>
												</View>
												<View className="flex-1">
													<View className="flex-row items-center gap-2">
														<Text className="flex-1 font-medium text-foreground text-sm">
															{feed.name}
														</Text>
														<View className="rounded-full bg-secondary px-2 py-0.5">
															<Text className="text-secondary-foreground text-[10px] font-medium">
																{feed.category}
															</Text>
														</View>
													</View>
													<Text className="mt-0.5 text-muted-foreground text-sm">
														{feed.description}
													</Text>
												</View>
												<Pressable
													className={`h-8 w-8 items-center justify-center rounded-lg border ${
														alreadySubscribed
															? "border-border bg-muted/40 opacity-50"
															: "border-border bg-muted/40 active:opacity-80"
													}`}
													disabled={alreadySubscribed}
													onPress={() =>
														handleAddFeed(feed.url, feed.name)
													}
												>
													<Icon
														as={Plus}
														size={16}
														className="text-muted-foreground"
													/>
												</Pressable>
											</View>
										);
									})}
								</View>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</View>
		</ScrollView>
	);
}
