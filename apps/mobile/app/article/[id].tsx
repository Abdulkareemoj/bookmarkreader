"use client"

import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Heart, Share2, Bookmark } from "lucide-react-native"
import { useState } from "react"

export default function ArticleScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  // Mock article data
  const article = {
    id,
    title: "Understanding Modern Web Architecture",
    author: "Jane Doe",
    date: "Oct 20, 2025",
    readTime: 8,
    category: "Technology",
    content: `
      Web architecture has evolved significantly over the past decade. Modern applications require careful consideration of performance, scalability, and user experience.

      Key considerations include:
      - Server-side rendering vs client-side rendering
      - State management strategies
      - Database optimization
      - Caching mechanisms
      - API design patterns

      Each of these aspects plays a crucial role in building robust applications that can handle millions of users while maintaining excellent performance.

      The future of web development will likely focus on edge computing, serverless architectures, and improved developer experience tools.
    `,
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => setLiked(!liked)}>
            <Heart size={24} color={liked ? "#ef4444" : "#6b7280"} fill={liked ? "#ef4444" : "none"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSaved(!saved)}>
            <Bookmark size={24} color={saved ? "#3b82f6" : "#6b7280"} fill={saved ? "#3b82f6" : "none"} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Share2 size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4">
        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 mb-3">{article.title}</Text>

        {/* Metadata */}
        <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <View>
            <Text className="text-sm font-medium text-gray-900">{article.author}</Text>
            <Text className="text-xs text-gray-600 mt-1">{article.date}</Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-blue-700">{article.readTime} min read</Text>
          </View>
        </View>

        {/* Article Content */}
        <Text className="text-base leading-7 text-gray-700">{article.content}</Text>

        {/* Category Tag */}
        <View className="mt-6 pt-4 border-t border-gray-100">
          <View className="bg-gray-100 px-3 py-1 rounded-full w-fit">
            <Text className="text-xs font-medium text-gray-700">{article.category}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
