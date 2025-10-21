import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { X, Home, Settings, LogOut } from "lucide-react-native"

interface SidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SidebarDrawer({ isOpen, onClose, activeTab, onTabChange }: SidebarDrawerProps) {
  if (!isOpen) return null

  const collections = [
    { id: "all", label: "All Bookmarks", icon: Home },
    { id: "work", label: "Work", icon: Home },
    { id: "personal", label: "Personal", icon: Home },
    { id: "research", label: "Research", icon: Home },
  ]

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Overlay */}
      <TouchableOpacity onPress={onClose} className="flex-1 bg-black/50" />

      {/* Drawer */}
      <View className="w-64 bg-white">
        {/* Header */}
        <View className="px-4 py-4 flex-row justify-between items-center border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Collections */}
        <ScrollView className="flex-1 px-4 py-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">Collections</Text>
          {collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              onPress={() => {
                onTabChange(collection.id)
                onClose()
              }}
              className={`px-3 py-2 rounded-lg mb-2 ${activeTab === collection.id ? "bg-blue-100" : "bg-transparent"}`}
            >
              <Text className={`font-medium ${activeTab === collection.id ? "text-blue-600" : "text-gray-700"}`}>
                {collection.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="border-t border-gray-200 px-4 py-4">
          <TouchableOpacity className="flex-row items-center py-2">
            <Settings size={20} color="#6b7280" />
            <Text className="ml-3 text-gray-700 font-medium">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2">
            <LogOut size={20} color="#6b7280" />
            <Text className="ml-3 text-gray-700 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
