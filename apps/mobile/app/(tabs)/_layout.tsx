import { Tabs, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Bookmark,
  Radio,
  Compass,
  Home,
  Search,
  Settings,
  Menu,
} from "lucide-react-native";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SidebarDrawer } from "@/components/sidebar-drawer";

export default function TabsLayout() {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { collectionId } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      // Reset search state when tab loses focus
      return () => {
        setShowSearchInput(false);
        setSearchQuery("");
        router.setParams({ searchQuery: undefined });
      };
    }, [])
  );

  const { top } = useSafeAreaInsets();

  const handleCollectionChange = (id: string) => {
    router.setParams({ collectionId: id });
  };

  return (
    <>
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={(collectionId as string) || "all"}
        onTabChange={handleCollectionChange}
      />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#e5e7eb",
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 88 : 70,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
            fontWeight: "600",
          },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#9ca3af",
          header: ({ route, options }) => (
            <View
              style={{ paddingTop: top + 10 }}
              className="flex-row items-center justify-between border-border border-b bg-background px-4 pb-4"
            >
              <View className="flex-row items-center gap-3 flex-1">
                {route.name === "bookmarks" && (
                  <TouchableOpacity
                    onPress={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-full active:bg-accent"
                  >
                    <Menu size={22} className="text-primary" />
                  </TouchableOpacity>
                )}
                {route.name === "settings" ? (
                  <Text className="font-bold text-xl text-foreground">
                    {options.title}
                  </Text>
                ) : showSearchInput ? (
                  <Input
                    placeholder={`Search ${route.name}...`}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      router.setParams({ searchQuery: text });
                    }}
                    className="mr-2 flex-1 h-9"
                    autoFocus
                  />
                ) : (
                  <Text className="font-bold text-xl text-foreground">
                    {options.title}
                  </Text>
                )}
              </View>

              {route.name !== "settings" && (
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setShowSearchInput((prev) => !prev)}
                    className="p-2 rounded-full active:bg-accent"
                  >
                    <Search
                      size={22}
                      className={showSearchInput ? "text-primary" : "text-muted-foreground"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ),
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rss"
        options={{
          title: "RSS",
          tabBarIcon: ({ color }) => <Radio size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      </Tabs>
    </>
  );
}
