import { View, TouchableOpacity } from "react-native";
import { Heart, Share2, Trash2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import type { Bookmark } from "@packages/store";
import React from "react";

interface ArticleCardMobileProps {
  bookmark: Bookmark;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

export function ArticleCardMobile({
  bookmark,
  onLike,
  onShare,
  onDelete,
  onPress,
}: ArticleCardMobileProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(bookmark.id)}
      className="px-4 py-3 border-b border-border"
    >
      <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
        {bookmark.title}
      </Text>

      {bookmark.description ? (
        <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
          {bookmark.description}
        </Text>
      ) : null}

      {/* URL */}
      <Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
        {bookmark.url}
      </Text>

      {/* Tags */}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <View className="flex-row gap-2 mt-2 flex-wrap">
          {bookmark.tags.slice(0, 3).map((tag) => (
            <View key={tag} className="bg-primary/10 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-primary">{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-3 mt-3 justify-end">
        <TouchableOpacity onPress={() => onLike(bookmark.id)}>
          <Heart
            size={18}
            color={bookmark.liked ? "#ef4444" : "#9ca3af"}
            fill={bookmark.liked ? "#ef4444" : "none"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(bookmark.id)}>
          <Share2 size={18} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(bookmark.id)}>
          <Trash2 size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}