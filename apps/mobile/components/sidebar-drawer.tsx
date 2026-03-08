import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { X, Home, Inbox, Heart, Bookmark, Settings, LogOut, ChevronRight } from "lucide-react-native"
import { useCollectionsStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SidebarDrawer({ isOpen, onClose, activeTab, onTabChange }: SidebarDrawerProps) {
  const { bookmarkCollections } = useCollectionsStore()

  if (!isOpen) return null

  const getCollectionIcon = (id: string) => {
    switch (id) {
      case "all": return Home
      case "inbox": return Inbox
      case "liked": return Heart
      case "saved": return Bookmark
      default: return ChevronRight
    }
  }

  // Combine default and user collections
  const collections = [
    { id: "all", name: "All Bookmarks" },
    { id: "liked", name: "Liked" },
    { id: "saved", name: "Saved" },
    ...bookmarkCollections.filter(c => c.id !== "all" && c.id !== "inbox"),
  ]

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Overlay */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        className="flex-1 bg-black/40 backdrop-blur-sm" 
      />

      {/* Drawer */}
      <View className="w-72 bg-background border-r border-border shadow-2xl">
        {/* Header */}
        <View className="px-6 pt-14 pb-6 flex-row justify-between items-center border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Library</Text>
          <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-accent">
            <X size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Collections */}
        <ScrollView className="flex-1 px-4 py-6">
          <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Collections</Text>
          {collections.map((collection) => {
            const Icon = getCollectionIcon(collection.id)
            const isActive = activeTab === collection.id

            return (
              <TouchableOpacity
                key={collection.id}
                onPress={() => {
                  onTabChange(collection.id)
                  onClose()
                }}
                className={cn(
                  "flex-row items-center px-4 py-3 rounded-xl mb-1",
                  isActive ? "bg-primary/10" : "active:bg-accent"
                )}
              >
                <Icon 
                  size={20} 
                  className={cn(isActive ? "text-primary" : "text-muted-foreground")} 
                />
                <Text className={cn(
                  "ml-3 font-semibold",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {collection.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Footer */}
        <View className="border-t border-border px-4 py-6 mb-8">
          <TouchableOpacity className="flex-row items-center px-4 py-3 rounded-xl active:bg-accent">
            <Settings size={20} className="text-muted-foreground" />
            <Text className="ml-3 text-foreground font-semibold">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-4 py-3 rounded-xl active:bg-accent">
            <LogOut size={20} className="text-muted-foreground" />
            <Text className="ml-3 text-foreground font-semibold">Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
