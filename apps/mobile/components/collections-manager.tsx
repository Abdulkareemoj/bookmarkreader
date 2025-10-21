"use client"

import { View, Text, TouchableOpacity, FlatList, Modal, TextInput } from "react-native"
import { Plus, Trash2 } from "lucide-react-native"
import { useState } from "react"

interface Collection {
  id: string
  label: string
  count: number
}

interface CollectionsManagerProps {
  collections: Collection[]
  onAddCollection: (name: string) => void
  onDeleteCollection: (id: string) => void
  onSelectCollection: (id: string) => void
}

export function CollectionsManager({
  collections,
  onAddCollection,
  onDeleteCollection,
  onSelectCollection,
}: CollectionsManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName)
      setNewCollectionName("")
      setShowModal(false)
    }
  }

  return (
    <>
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">Collections</Text>
          <TouchableOpacity onPress={() => setShowModal(true)} className="bg-blue-500 p-2 rounded-full">
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectCollection(item.id)}
              className="flex-row justify-between items-center py-2 px-3 bg-gray-50 rounded-lg mb-2"
            >
              <View>
                <Text className="font-medium text-gray-900">{item.label}</Text>
                <Text className="text-xs text-gray-600">{item.count} items</Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteCollection(item.id)}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>

      {/* Add Collection Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">New Collection</Text>
            <TextInput
              placeholder="Collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-lg">
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddCollection} className="flex-1 bg-blue-500 py-3 rounded-lg">
                <Text className="text-center text-white font-medium">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}
