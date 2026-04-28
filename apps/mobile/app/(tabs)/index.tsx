import { Stack } from "expo-router";
import { Bookmark, Compass, Heart, Rss } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { useReaderStore } from "@/lib/store";

export default function Home() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);

	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const likedItems = bookmarks.filter((b) => b.liked).length;
	const totalFeeds = feeds.length;

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
			title: "Liked Items",
			value: likedItems,
			icon: Heart,
			to: "/bookmarks?collectionId=liked",
			colorClass: "text-red-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Compass,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}
			showsVerticalScrollIndicator={false}
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

			<View className="mt-7">
				<Card >
					<CardHeader>
						<CardTitle >Recent Activity</CardTitle>
					</CardHeader>
					<CardContent className="">
						<Text className="text-sm text-muted-foreground">
						{totalBookmarks === 0 && totalFeeds === 0
							? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
							: `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
						</Text>
					</CardContent>
				</Card>
			</View>
		</ScrollView>
	);
}
