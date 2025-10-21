"use client"

import { View, TextInput, TouchableOpacity } from "react-native"
import { Search, X } from "lucide-react-native"
import { useState } from "react"

interface SearchBarMobileProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBarMobile({ onSearch, placeholder = "Search bookmarks..." }: SearchBarMobileProps) {
  const [query, setQuery] = useState("")

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <View className="px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
        <Search size={20} color="#9ca3af" />
        <TextInput
          placeholder={placeholder}
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            onSearch(text)
          }}
          placeholderTextColor="#9ca3af"
          className="flex-1 ml-2 text-gray-900"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
