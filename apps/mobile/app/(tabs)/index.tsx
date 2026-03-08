import { Text, View, ScrollView } from "react-native";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { Bookmark, Rss, Compass, Heart } from "lucide-react-native";
import { Stack } from "expo-router";
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
    <ScrollView className="flex-1 bg-background p-4">
      <Stack.Screen options={{ title: "Dashboard" }} />

      <Text className="mb-8 text-muted-foreground">
        A quick overview of your saved content and feeds.
      </Text>

      <View className="flex-row flex-wrap justify-between gap-4">
        {dashboardData.map((item) => (
          <View key={item.title} className="w-[48%]">
            <DashboardCardMobile {...item} />
          </View>
        ))}
      </View>

      {/* Placeholder for recent activity or quick actions */}
      <View className="mt-10">
        <Text className="mb-4 font-semibold text-2xl text-foreground">
          Recent Activity
        </Text>
        <View className="rounded-lg border border-border bg-card p-6">
          <Text className="text-muted-foreground">
            {totalBookmarks === 0 && totalFeeds === 0
              ? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
              : `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
