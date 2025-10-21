"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { Highlight, MessageCircle } from "lucide-react-native"
import { useState } from "react"

interface ArticleReaderProps {
  title: string
  content: string
  author: string
  date: string
}

export function ArticleReader({ title, content, author, date }: ArticleReaderProps) {
  const [selectedText, setSelectedText] = useState("")
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)

  return (
    <ScrollView className="flex-1 px-4 py-4">
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">{title}</Text>

      {/* Metadata */}
      <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
        <View>
          <Text className="text-sm font-medium text-gray-900">{author}</Text>
          <Text className="text-xs text-gray-600 mt-1">{date}</Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-base leading-7 text-gray-700">{content}</Text>

      {/* Highlight Menu */}
      {showHighlightMenu && (
        <View className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 flex-row justify-around">
          <TouchableOpacity className="items-center">
            <Highlight size={20} color="#fbbf24" />
            <Text className="text-xs text-gray-700 mt-1">Yellow</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Highlight size={20} color="#86efac" />
            <Text className="text-xs text-gray-700 mt-1">Green</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Highlight size={20} color="#60a5fa" />
            <Text className="text-xs text-gray-700 mt-1">Blue</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <MessageCircle size={20} color="#f472b6" />
            <Text className="text-xs text-gray-700 mt-1">Note</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}
