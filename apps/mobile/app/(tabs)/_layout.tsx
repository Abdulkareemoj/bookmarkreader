import { Tabs, router, useFocusEffect } from "expo-router";
import { Bookmark, Radio, Compass, Home, Search } from "lucide-react-native";
import { TouchableOpacity, View, Text } from "react-native";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        header: ({ route, options }) => (
          <View className="flex-row items-center justify-between border-gray-200 border-b bg-white px-4 pt-10 pb-6">
            {showSearchInput ? (
              <Input
                placeholder={`Search ${route.name}...`}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  router.setParams({ searchQuery: text });
                }}
                className="mr-2 flex-1"
              />
            ) : (
              <Text className="font-bold text-lg">{options.title}</Text>
            )}
            <TouchableOpacity
              onPress={() => setShowSearchInput((prev) => !prev)}
              style={{ paddingLeft: 10 }}
            >
              <Search size={24} color="#3b82f6" />
            </TouchableOpacity>
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
    </Tabs>
  );
}
