"use client"

import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native"
import { X, Check } from "lucide-react-native"
import { useState } from "react"

interface AnnotationModalProps {
  visible: boolean
  onClose: () => void
  onSave: (text: string) => void
}

export function AnnotationModal({ visible, onClose, onSave }: AnnotationModalProps) {
  const [text, setText] = useState("")

  const handleSave = () => {
    if (text.trim()) {
      onSave(text)
      setText("")
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Add Note</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <TextInput
            placeholder="Write your note here..."
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900"
            placeholderTextColor="#9ca3af"
          />

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-100 py-3 rounded-lg">
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Check size={20} color="white" />
              <Text className="ml-2 text-white font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
