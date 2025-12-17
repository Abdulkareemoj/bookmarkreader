import { Text, View, FlatList } from "react-native";
import { useFeeds } from "@/hooks/use-feeds";
import { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { useReaderStore } from "@/lib/store";
import { mockFeeds, mockArticles } from "@/lib/mock-rss-data";
import { RssArticleCardMobile } from "@/components/rss-article-card-mobile";
import { Rss } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

//  initialize store with mock data
function initializeRssStore(addFeed: any, addArticles: any, storeFeeds: any) {
  if (storeFeeds.length === 0) {
    mockFeeds.forEach((f) => {
      addFeed(f);
    });
    addArticles(mockArticles);
  }
}

export default function RssScreen() {
  const router = useRouter();
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

  // Initialize mock data into the store if it's empty
  useEffect(() => {
    initializeRssStore(addFeed, addArticles, storeFeeds);
  }, [addFeed, addArticles, storeFeeds.length]);

  // Sort articles by date
  const sortedArticles = useMemo(() => {
    return articles.sort(
      (a, b) =>
        new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
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
