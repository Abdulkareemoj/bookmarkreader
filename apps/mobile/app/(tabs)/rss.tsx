"use client"

import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native"
import { Plus } from "lucide-react-native"
import { useState } from "react"

const mockFeeds = [
  { id: "1", title: "TechCrunch", url: "techcrunch.com", articles: 24 },
  { id: "2", title: "The Verge", url: "theverge.com", articles: 18 },
  { id: "3", title: "Hacker News", url: "news.ycombinator.com", articles: 30 },
]

const mockArticles = [
  { id: "1", title: "New AI Model Released", source: "TechCrunch", date: "2 hours ago" },
  { id: "2", title: "Latest Tech Trends", source: "The Verge", date: "4 hours ago" },
  { id: "3", title: "Startup Funding News", source: "Hacker News", date: "6 hours ago" },
]

export default function RSSScreen() {
  const [selectedFeed, setSelectedFeed] = useState("all")

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">RSS Feeds</Text>
        <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Feeds */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2">
        <TouchableOpacity
          onPress={() => setSelectedFeed("all")}
          className={`mr-2 px-4 py-2 rounded-full ${selectedFeed === "all" ? "bg-blue-500" : "bg-gray-100"}`}
        >
          <Text className={`font-medium ${selectedFeed === "all" ? "text-white" : "text-gray-700"}`}>All</Text>
        </TouchableOpacity>
        {mockFeeds.map((feed) => (
          <TouchableOpacity
            key={feed.id}
            onPress={() => setSelectedFeed(feed.id)}
            className={`mr-2 px-4 py-2 rounded-full ${selectedFeed === feed.id ? "bg-blue-500" : "bg-gray-100"}`}
          >
            <Text className={`font-medium ${selectedFeed === feed.id ? "text-white" : "text-gray-700"}`}>
              {feed.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles List */}
      <FlatList
        data={mockArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="px-4 py-3 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-sm text-gray-600">{item.source}</Text>
              <Text className="text-xs text-gray-500">{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  )
}
