import { Text, View, ScrollView } from "react-native";
import { DashboardCardMobile } from "@/components/dashboard-card-mobile";
import { Bookmark, Rss, Compass, Heart } from "lucide-react-native";
import { Stack } from "expo-router";

// Mock data for dashboard summary
const dashboardData = [
  {
    title: "Total Bookmarks",
    value: 42,
    icon: Bookmark,
    to: "/bookmarks",
    colorClass: "text-blue-500",
  },
  {
    title: "Unread Articles",
    value: 15,
    icon: Rss,
    to: "/rss",
    colorClass: "text-orange-500",
  },
  {
    title: "Liked Items",
    value: 8,
    icon: Heart,
    to: "/bookmarks",
    colorClass: "text-red-500",
  },
  {
    title: "New in Explore",
    value: 5,
    icon: Compass,
    to: "/explore",
    colorClass: "text-green-500",
  },
];

export default function Home() {
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
            No recent activity yet. Start saving bookmarks or subscribing to
            feeds!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
