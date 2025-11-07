import { Text, View, FlatList, Linking } from "react-native";
import { useFeeds } from "@/hooks/use-feeds";
import { useEffect, useState, useMemo } from "react";
import { useReaderStore } from "@/lib/store";
import { mockFeeds, mockArticles } from "@/lib/mock-rss-data";
import { RssArticleCardMobile } from "@/components/rss-article-card-mobile";
import { Rss } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

// Helper to initialize store with mock data
function initializeRssStore(addFeed: any, addArticles: any, storeFeeds: any) {
  if (storeFeeds.length === 0) {
    mockFeeds.forEach((f) => addFeed(f));
    addArticles(mockArticles);
  }
}

export default function RssScreen() {
  const {
    feeds,
    articles,
    addFeed,
    addArticles,
    toggleArticleRead,
    toggleArticleLike,
    toggleArticleSave,
  } = useFeeds();
  const storeFeeds = useReaderStore((state) => state.feeds);

  // Initialize mock data into the store if it's empty (for demo purposes)
  useEffect(() => {
    initializeRssStore(addFeed, addArticles, storeFeeds);
  }, [addFeed, addArticles, storeFeeds.length]);

  // Sort articles by date (newest first)
  const sortedArticles = useMemo(() => {
    return articles.sort(
      (a, b) =>
        new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
    );
  }, [articles]);

  const getFeedTitle = (feedId: string) => {
    return feeds.find((f) => f.id === feedId)?.title || "Unknown Feed";
  };

  const handleArticlePress = (link: string) => {
    // In a real app, we might navigate to an internal reader view,
    // but for now, we'll open the link externally.
    Linking.openURL(link);
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
              onPress={handleArticlePress}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <Icon as={Rss} size={48} className="text-muted-foreground mb-4" />
          <Text className="mb-2 text-muted-foreground text-lg font-semibold">
            No Articles Found
          </Text>
          <Text className="text-muted-foreground text-sm text-center">
            Subscribe to an RSS feed to start reading articles.
          </Text>
        </View>
      )}
    </View>
  );
}
