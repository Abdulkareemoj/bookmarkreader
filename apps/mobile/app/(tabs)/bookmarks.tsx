import BookmarkCard from "@/components/bookmark-card";
import { FlatList, View, Text, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useEffect } from "react";
import { bookmarks as mockBookmarks } from "@/lib/mock-data";
import { useReaderStore } from "@/lib/store";
import type { Bookmark, ReaderState } from "@packages/store";

export default function Bookmarks() {
  const { searchQuery } = useLocalSearchParams();
  const collectionId = "all";

  const { bookmarks, toggleLike, toggleSave, removeBookmark, addBookmark } =
    useBookmarks(collectionId);

  const search =
    (Array.isArray(searchQuery)
      ? searchQuery[0]
      : searchQuery
    )?.toLowerCase() || "";

  const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) => {
    const titleMatch = bookmark.title.toLowerCase().includes(search);
    const urlMatch = bookmark.url?.toLowerCase().includes(search);
    const tagMatch = bookmark.tags.some((tag: string) =>
      tag.toLowerCase().includes(search)
    );
    return titleMatch || urlMatch || tagMatch;
  });

  const handleBookmarkPress = (url: string) => {
    Linking.openURL(url);
  };

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
              onOpenExternal={() => handleBookmarkPress(item.url)}
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
