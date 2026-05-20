import type { Article } from "@packages/store";
import { useRouter } from "expo-router";
import {
  Bookmark,
  Check,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react-native";
import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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
    <Pressable
      onPress={onPress}
      className={cn("mb-3 active:opacity-90", article.read ? "opacity-70" : "")}
    >
      <Card className="gap-0 overflow-hidden py-0">
        <View className="flex-row">
          {/* Thumbnail */}
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              className="h-24 w-24 rounded-l-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="h-24 w-24 items-center justify-center rounded-l-lg bg-muted">
              <ImageIcon size={20} className="text-muted-foreground" />
            </View>
          )}

          <CardContent className="flex-1 p-3">
            <Text
              className={cn(
                "text-sm text-foreground leading-snug",
                article.read ? "font-medium" : "font-semibold",
              )}
              numberOfLines={3}
            >
              {article.title}
            </Text>
            {article.contentSnippet ? (
              <Text className="mt-1 text-muted-foreground text-xs" numberOfLines={2}>
                {article.contentSnippet.replace(/<[^>]*>/g, "").slice(0, 100)}
              </Text>
            ) : null}
          </CardContent>
        </View>

        {/* Footer bar */}
        <View className="flex-row items-center justify-between border-border/50 border-t px-4 py-1.5">
          <View className="flex-row items-center gap-2 shrink-1 min-w-0">
            <LinkIcon size={12} className="text-muted-foreground shrink-0" />
            <Text
              className="font-medium text-muted-foreground text-xs shrink-1"
              numberOfLines={1}
            >
              {feedTitle}
            </Text>
            <Text className="text-muted-foreground text-xs shrink-0">·</Text>
            <Text className="text-muted-foreground text-xs shrink-0">
              {article.pubDate
                ? new Date(article.pubDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </Text>
          </View>

          <View className="flex-row items-center gap-0.5 shrink-0">
            <Pressable
              onPress={() => onToggleLike(article.id)}
              className="rounded-md p-1.5 active:bg-accent"
              hitSlop={6}
            >
              <Heart
                size={16}
                color={article.liked ? "#ef4444" : "#9ca3af"}
                fill={article.liked ? "#ef4444" : "none"}
              />
            </Pressable>
            <Pressable
              onPress={() => onToggleSave(article.id)}
              className="rounded-md p-1.5 active:bg-accent"
              hitSlop={6}
            >
              <Bookmark
                size={16}
                color={article.saved ? "#3b82f6" : "#9ca3af"}
                fill={article.saved ? "#3b82f6" : "none"}
              />
            </Pressable>
            <Pressable
              onPress={() => onToggleRead(article.id)}
              className="rounded-md p-1.5 active:bg-accent"
              hitSlop={6}
            >
              <Check
                size={16}
                color={article.read ? "#3b82f6" : "#9ca3af"}
              />
            </Pressable>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export const RssArticleCardMobile = memo(RssArticleCardMobileBase);