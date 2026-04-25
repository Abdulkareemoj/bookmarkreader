import { BookOpen, Heart, Bookmark, Rss, TrendingUp, Plus } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { useReaderStore } from "@/lib/store";

const suggestedFeeds = [
	{
		icon: "🔶",
		name: "Hacker News",
		desc: "Top stories from tech & startups",
		tag: "Tech",
		url: "https://news.ycombinator.com/rss",
	},
	{
		icon: "🟣",
		name: "r/programming",
		desc: "Computer programming discussion",
		tag: "Tech",
		url: "https://www.reddit.com/r/programming/.rss",
	},
	{
		icon: "🌐",
		name: "r/webdev",
		desc: "Web development news",
		tag: "Dev",
		url: "https://www.reddit.com/r/webdev/.rss",
	},
	{
		icon: "🔨",
		name: "Smashing Magazine",
		desc: "Web design & development",
		tag: "Design",
		url: "https://www.smashingmagazine.com/feed",
	},
	{
		icon: "⭐",
		name: "CSS-Tricks",
		desc: "Tips, tricks, and techniques on CSS",
		tag: "CSS",
		url: "https://css-tricks.com/feed",
	},
	{
		icon: "▲",
		name: "Vercel Blog",
		desc: "Updates from the Vercel team",
		tag: "Dev",
		url: "https://vercel.com/atom",
	},
	{
		icon: "🔵",
		name: "The Verge",
		desc: "Tech, science, and culture",
		tag: "Tech",
		url: "https://www.theverge.com/rss/index.xml",
	},
	{
		icon: "🔴",
		name: "Ars Technica",
		desc: "Technology news and analysis",
		tag: "Tech",
		url: "https://feeds.arstechnica.com/arstechnica/index",
	},
];

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
			<Text className="text-center font-medium text-foreground text-sm">{title}</Text>
			<Text className="max-w-[240px] text-center text-muted-foreground text-sm leading-relaxed">
				{desc}
			</Text>
			{action && (
				<TouchableOpacity
					onPress={action.onPress}
					className="mt-2 rounded-lg bg-primary px-4 py-2 active:opacity-70"
				>
					<Text className="text-primary-foreground text-sm font-medium">{action.label}</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

export default function Explore() {
	const { top } = useSafeAreaInsets();
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);

	// Calculate real stats
	const readArticles = articles.filter((a) => a.read).length;
	const likedArticles = articles.filter((a) => a.liked).length;
	const savedArticles = bookmarks.filter((b) => b.saved).length;
	const totalArticles = articles.length;

	const stats = [
		{ icon: BookOpen, label: "Articles read", value: readArticles, to: "/rss", colorClass: "text-blue-500" },
		{ icon: Heart, label: "Articles liked", value: likedArticles, to: "/rss", colorClass: "text-red-500" },
		{ icon: Bookmark, label: "Articles saved", value: savedArticles, to: "/bookmarks", colorClass: "text-green-500" },
		{ icon: Rss, label: "Total articles", value: totalArticles, to: "/rss", colorClass: "text-purple-500" },
	];

	return (
		<ScrollView 
			className="flex-1 bg-background" 
			// contentContainerStyle={{ paddingTop: top + 20, paddingBottom: 100 }}
			showsVerticalScrollIndicator={false}
		>
		<View className="p-4">
			{/* <Text className="mt-1 text-muted-foreground">
				Discover content and insights from your feeds
			</Text> */}
			
					

				<View className="py-2">
					<View className="flex-row flex-wrap gap-3">
						{stats.map((s) => (
              	<View key={s.label} className="w-[48%]">
							<DashboardCardMobile
								key={s.label}
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

				<View className="py-2 space-y-4">
					<Card>
						<CardHeader>
							<View className="flex-row items-center gap-2">
								<Rss size={16} className="text-primary" />
								<CardTitle>Best of your feeds</CardTitle>
							</View>
							<CardDescription>Latest unread articles across all sources</CardDescription>
						</CardHeader>
						<CardContent>
							<EmptyCard
								title="No feeds yet"
								desc="Add some feeds to see articles here"
								action={{ label: "+ Add feed", onPress: () => {} }}
							/>
						</CardContent>
					</Card>

		</View>
    	<View className="py-2 space-y-4">
					<Card>
						<CardHeader>
							<View className="flex-row items-center gap-2">
								<TrendingUp size={16} className="text-primary" />
								<CardTitle>Read more like this</CardTitle>
							</View>
							<CardDescription>Personalised recommendations from your activity</CardDescription>
						</CardHeader>
						<CardContent>
							<EmptyCard
								title="Nothing yet"
								desc="Like some articles to get personalised recommendations"
							/>
						</CardContent>
					</Card>
				</View>

				<View className="py-2">
					<Card>
						<CardHeader>
							<View className="flex-row items-center gap-2">
								<Bookmark size={16} className="text-primary" />
								<CardTitle>Your backlog</CardTitle>
							</View>
							<CardDescription>Saved articles you haven't read yet</CardDescription>
						</CardHeader>
						<CardContent>
							<EmptyCard
								title="All caught up"
								desc="No unread saved articles — you're on top of it"
							/>
						</CardContent>
					</Card>
				</View>
	<View className="py-2">
				<Card>
					<CardHeader>
						<View className="flex-row items-center gap-2">
							<TrendingUp size={16} className="text-primary" />
							<CardTitle>Discover feeds</CardTitle>
						</View>
						<CardDescription>Curated sources worth following</CardDescription>
					</CardHeader>
					<CardContent>
						<View className="space-y-2">
							{suggestedFeeds.map((feed) => (
								<View
									key={feed.name}
									className="flex-row mb-2 items-center gap-3 rounded-lg border border-border bg-card p-3"
								>
									<View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
										<Text className="text-sm">{feed.icon}</Text>
									</View>
									<View className="flex-1">
										<View className="flex-row items-center gap-2">
											<Text className="flex-1 font-medium text-foreground text-sm">
												{feed.name}
											</Text>
											<View className="rounded-full bg-secondary px-2 py-1">
												<Text className="text-secondary-foreground text-[10px] font-medium">
													{feed.tag}
												</Text>
											</View>
										</View>
										<Text className="mt-0.5 text-muted-foreground text-sm">
											{feed.desc}
										</Text>
									</View>
									<TouchableOpacity className="h-8 w-8 items-center justify-center rounded-lg active:bg-accent">
										<Plus size={16} className="text-muted-foreground" />
									</TouchableOpacity>
								</View>
							))}
						</View>
					</CardContent>
				</Card>
			</View>
			</View>
		</ScrollView>
	);
}