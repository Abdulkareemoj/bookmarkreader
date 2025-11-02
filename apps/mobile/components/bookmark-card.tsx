import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, View } from "react-native";

interface BookmarkCardProps {
  id: string;
  title: string;
  url: string;
}

export default function BookmarkCard({ id, title, url }: BookmarkCardProps) {
  return (
    <Link href={{ pathname: "/article/[id]", params: { id } }} asChild>
      <View className="p-4 bg-card border border-border rounded-lg mb-4">
        <View>
          <Text className="text-lg font-bold text-foreground">{title}</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <Feather name="link" size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground truncate">{url}</Text>
        </View>
      </View>
    </Link>
  );
}
