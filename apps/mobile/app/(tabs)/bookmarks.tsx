"use client"

import { View, Text, FlatList } from "react-native"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useState } from "react"
import { SearchBarMobile } from "@/components/search-bar-mobile"
import { CollectionTabs } from "@/components/collection-tabs"
import { ArticleCardMobile } from "@/components/article-card-mobile"
import { useRouter } from "expo-router"

export default function BookmarksScreen() {
  const router = useRouter()
  const { bookmarks, toggleLike, removeBookmark } = useBookmarks()
  const [selectedCollection, setSelectedCollection] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const collections = [
    { id: "all", label: "All" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
    { id: "research", label: "Research" },
  ]

  let filteredBookmarks =
    selectedCollection === "all" ? bookmarks : bookmarks.filter((b) => b.collectionId === selectedCollection)

  if (searchQuery) {
    filteredBookmarks = filteredBookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Bookmarks</Text>
      </View>

      {/* Search */}
      <SearchBarMobile onSearch={setSearchQuery} />

      {/* Collections */}
      <CollectionTabs
        collections={collections}
        activeCollection={selectedCollection}
        onCollectionChange={setSelectedCollection}
      />

      {/* Bookmarks List */}
      <FlatList
        data={filteredBookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCardMobile
            article={item}
            onLike={toggleLike}
            onShare={(id) => console.log("Share:", id)}
            onDelete={removeBookmark}
            onPress={(id) => router.push(`/article/${id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-600">No bookmarks found</Text>
          </View>
        }
      />
    </View>
  )
}
