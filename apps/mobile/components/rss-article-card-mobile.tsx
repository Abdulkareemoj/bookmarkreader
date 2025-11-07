import { View, Text, TouchableOpacity } from "react-native";
import { Heart, Bookmark, Check, Link as LinkIcon } from "lucide-react-native";
import type { Article } from "@packages/store";
import { cn } from "@/lib/utils";

interface RssArticleCardMobileProps {
  article: Article;
  feedTitle: string;
  onToggleRead: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onPress: (link: string) => void;
}

export function RssArticleCardMobile({
  article,
  feedTitle,
  onToggleRead,
  onToggleLike,
  onToggleSave,
  onPress,
}: RssArticleCardMobileProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(article.link)}
      className={cn(
        "p-4 border border-border rounded-lg mb-4 active:opacity-80",
        article.read ? "bg-card/50 opacity-70" : "bg-card shadow-sm"
      )}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          <Text
            className={cn(
              "text-lg font-bold text-foreground",
              article.read && "font-medium"
            )}
            numberOfLines={2}
          >
            {article.title}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {article.contentSnippet || "No snippet available."}
      </Text>

      {/* Metadata */}
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center gap-2">
          <LinkIcon size={14} className="text-muted-foreground" />
          <Text className="text-xs text-muted-foreground font-medium">
            {feedTitle}
          </Text>
          <Text className="text-xs text-muted-foreground">•</Text>
          <Text className="text-xs text-muted-foreground">
            {article.pubDate
              ? new Date(article.pubDate).toLocaleDateString()
              : "Unknown Date"}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 mt-3 justify-end border-t border-border/50 pt-2">
        <TouchableOpacity onPress={() => onToggleLike(article.id)}>
          <Heart
            size={20}
            color={article.liked ? "#ef4444" : "#d1d5db"}
            fill={article.liked ? "#ef4444" : "none"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onToggleSave(article.id)}>
          <Bookmark
            size={20}
            color={article.saved ? "#3b82f6" : "#d1d5db"}
            fill={article.saved ? "#3b82f6" : "none"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onToggleRead(article.id)}>
          <Check
            size={20}
            color={article.read ? "#3b82f6" : "#d1d5db"}
            className={cn(article.read && "text-primary")}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
