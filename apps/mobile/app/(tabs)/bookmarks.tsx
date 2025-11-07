import BookmarkCard from "@/components/bookmark-card";
import { FlatList, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useEffect } from "react";
import { bookmarks as mockBookmarks } from "@/lib/mock-data";
import { useReaderStore } from "@/lib/store";

export default function Bookmarks() {
  const { searchQuery } = useLocalSearchParams();
  const collectionId = "all"; // Mobile currently shows all bookmarks

  const { bookmarks, toggleLike, toggleSave, removeBookmark, addBookmark } =
    useBookmarks(collectionId);

  // Initialize mock data into the store if it's empty (for demo purposes)
  const storeBookmarks = useReaderStore((state) => state.bookmarks);
  useEffect(() => {
    if (storeBookmarks.length === 0) {
      mockBookmarks.forEach((b) => addBookmark(b));
    }
  }, [storeBookmarks.length, addBookmark]);

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
      bookmark.url?.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
      bookmark.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery?.toLowerCase() || "")
      )
  );

  return (
    <View className="flex-1 bg-background">
      {filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={({ item }) => (
            <BookmarkCard
              {...item}
              onLike={() => toggleLike(item.id)}
              onSave={() => toggleSave(item.id)}
              onDelete={() => removeBookmark(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="mb-2 text-muted-foreground">No bookmarks found</Text>
          <Text className="text-muted-foreground text-sm">
            {searchQuery
              ? "Try adjusting your search query"
              : "No bookmarks available"}
          </Text>
        </View>
      )}
    </View>
  );
}
