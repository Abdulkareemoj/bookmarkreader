import { memo } from "react";
import { View, Pressable, Image } from "react-native";
import { Heart, Bookmark, Check, Link as LinkIcon, Image as ImageIcon } from "lucide-react-native";
import type { Article } from "@packages/store";
import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface RssArticleCardMobileProps {
  article: Article;
  feedTitle: string;
  onToggleRead: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onPress: () => void;
}

function RssArticleCardMobileBase({
  article,
  feedTitle,
  onToggleRead,
  onToggleLike,
  onToggleSave,
  onPress,
}: RssArticleCardMobileProps) {
  return (
    <Link
      href={{
        pathname: "/rss/[id]",
        params: { id: article.id, article: JSON.stringify(article) },
      }}
      asChild
    >
      <Pressable
        onPress={onPress}
        className={cn(
          "mb-3 active:opacity-90",
          article.read ? "opacity-80" : ""
        )}
      >
        <Card className="gap-0 overflow-hidden py-0">
          <View className="flex-row">
            {/* Image Section */}
            {article.imageUrl ? (
              <Image
                source={{ uri: article.imageUrl }}
                className="w-24 h-24 rounded-l-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 bg-muted rounded-l-lg items-center justify-center">
                <ImageIcon size={20} className="text-muted-foreground" />
              </View>
            )}

            <CardContent className="flex-1 p-4">
              <Text
                className={cn("text-base text-foreground", article.read ? "font-medium" : "font-semibold")}
                numberOfLines={2}
              >
                {article.title}
              </Text>
              <Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
                {article.contentSnippet || "No snippet available."}
              </Text>
            </CardContent>
          </View>

          <View className="flex-row items-center justify-between border-border/50 border-t px-4 py-1">
            <View className="flex-row items-center gap-2">
              <LinkIcon size={14} className="text-muted-foreground" />
              <Text className="max-w-[42%] font-medium text-muted-foreground text-xs" numberOfLines={1}>
                {feedTitle}
              </Text>
              <Text className="text-muted-foreground text-xs">•</Text>
              <Text className="text-muted-foreground text-xs">
                {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : "Unknown Date"}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Pressable onPress={() => onToggleLike(article.id)} className="rounded-md p-2 active:bg-accent">
                <Heart
                  size={18}
                  color={article.liked ? "#ef4444" : "#d1d5db"}
                  fill={article.liked ? "#ef4444" : "none"}
                />
              </Pressable>
              <Pressable onPress={() => onToggleSave(article.id)} className="rounded-md p-2 active:bg-accent">
                <Bookmark
                  size={18}
                  color={article.saved ? "#3b82f6" : "#d1d5db"}
                  fill={article.saved ? "#3b82f6" : "none"}
                />
              </Pressable>
              <Pressable onPress={() => onToggleRead(article.id)} className="rounded-md p-2 active:bg-accent">
                <Check
                  size={18}
                  color={article.read ? "#3b82f6" : "#d1d5db"}
                  className={cn(article.read && "text-primary")}
                />
              </Pressable>
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

export const RssArticleCardMobile = memo(RssArticleCardMobileBase);
