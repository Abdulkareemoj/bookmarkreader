import BookmarkCard from "@/components/bookmark-card";
import { FlatList, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

const bookmarks = [
  {
    id: "b1",
    title: "React Documentation",
    url: "https://react.dev/",
    notes: "The official documentation for React.",
    tags: ["React", "JavaScript"],
  },
  {
    id: "b2",
    title: "Next.js Best Practices",
    url: "https://nextjs.org/docs/app/building-your-application/optimizing/best-practices",
    notes: "Learn how to build performant Next.js applications",
    tags: ["Next.js", "Web Development"],
  },
  {
    id: "b3",
    title: "TypeScript Advanced Types",
    url: "https://www.typescriptlang.org/docs/handbook/advanced-types.html",
    notes: "Master advanced TypeScript patterns",
    tags: ["TypeScript", "Programming"],
  },
];

export default function Bookmarks() {
  const { searchQuery } = useLocalSearchParams();

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
    bookmark.notes.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
    bookmark.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    )
  );

  return (
    <View className="flex-1 bg-background">
      {filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={({ item }) => <BookmarkCard {...item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="mb-2 text-muted-foreground">No bookmarks found</Text>
          <Text className="text-muted-foreground text-sm">
            No bookmarks available
          </Text>
        </View>
      )}
    </View>
  );
}
