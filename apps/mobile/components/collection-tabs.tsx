import { View, ScrollView, TouchableOpacity, Text } from "react-native"

interface CollectionTabsProps {
  collections: Array<{ id: string; label: string }>
  activeCollection: string
  onCollectionChange: (id: string) => void
}

export function CollectionTabs({ collections, activeCollection, onCollectionChange }: CollectionTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
      <View className="flex-row px-4 py-2">
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            onPress={() => onCollectionChange(collection.id)}
            className={`mr-2 px-4 py-2 rounded-full ${
              activeCollection === collection.id ? "bg-blue-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`capitalize font-medium ${
                activeCollection === collection.id ? "text-white" : "text-gray-700"
              }`}
            >
              {collection.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}
