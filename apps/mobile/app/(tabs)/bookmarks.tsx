import BookmarkCard from "@/components/bookmark-card";
import { FlatList, View, Text, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { Bookmark } from "@packages/store";
import { AddBookmarkModal } from "@/components/add-bookmark-modal";

export default function Bookmarks() {
  const { searchQuery, collectionId = "all" } = useLocalSearchParams();

  const { bookmarks, toggleLike, toggleSave, removeBookmark, addBookmark } =
    useBookmarks(collectionId as string);

  const search =
    (Array.isArray(searchQuery) ? searchQuery[0] : searchQuery)?.toLowerCase() ||
    "";

  const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) => {
    const titleMatch = bookmark.title.toLowerCase().includes(search);
    const urlMatch = bookmark.url?.toLowerCase().includes(search) || false;
    const tagMatch = bookmark.tags?.some((tag: string) =>
      tag.toLowerCase().includes(search)
    ) || false;
    return titleMatch || urlMatch || tagMatch;
  });

  const handleBookmarkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <AddBookmarkModal
          onAddBookmark={(data) => {
            addBookmark({
              ...data,
              tags: [],
            });
          }}
        />
      </View>
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
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
