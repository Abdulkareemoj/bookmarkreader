import { View, Text, TouchableOpacity } from "react-native"
import { Heart, Share2, Trash2 } from "lucide-react-native"
import type { Bookmark } from "@/lib/store"

interface ArticleCardMobileProps {
  article: Bookmark
  onLike: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
  onPress: (id: string) => void
}

export function ArticleCardMobile({ article, onLike, onShare, onDelete, onPress }: ArticleCardMobileProps) {
  return (
    <TouchableOpacity onPress={() => onPress(article.id)} className="px-4 py-3 border-b border-gray-100">
      <Text className="text-lg font-semibold text-gray-900">{article.title}</Text>
      <Text className="text-sm text-gray-600 mt-1">{article.subtitle}</Text>

      {/* Metadata */}
      <View className="flex-row justify-between items-center mt-2">
        <View className="flex-row gap-1">
          <Text className="text-xs text-gray-500">{article.author}</Text>
          <Text className="text-xs text-gray-500">•</Text>
          <Text className="text-xs text-gray-500">{article.readTime} min read</Text>
        </View>
      </View>

      {/* Tags */}
      {article.tags.length > 0 && (
        <View className="flex-row gap-2 mt-2">
          {article.tags.slice(0, 3).map((tag) => (
            <View key={tag} className="bg-blue-100 px-2 py-1 rounded">
              <Text className="text-xs text-blue-700">{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-3 mt-3 justify-end">
        <TouchableOpacity onPress={() => onLike(article.id)}>
          <Heart size={18} color={article.liked ? "#ef4444" : "#d1d5db"} fill={article.liked ? "#ef4444" : "none"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(article.id)}>
          <Share2 size={18} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(article.id)}>
          <Trash2 size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
