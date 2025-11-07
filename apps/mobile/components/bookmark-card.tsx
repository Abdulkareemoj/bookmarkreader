import { Link } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { Heart, Bookmark, Trash2, Link as LinkIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  id: string;
  title: string;
  url: string;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function BookmarkCard({
  id,
  title,
  url,
  liked,
  saved,
  onLike,
  onSave,
  onDelete,
}: BookmarkCardProps) {
  return (
    <Link href={{ pathname: "/article/[id]", params: { id } }} asChild>
      <TouchableOpacity className="p-4 bg-card border border-border rounded-lg mb-4 active:opacity-80">
        <View>
          <Text className="text-lg font-bold text-foreground">{title}</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <LinkIcon size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground flex-1 truncate">
            {url}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-4 mt-4 justify-end">
          <TouchableOpacity onPress={onLike} className="p-1">
            <Heart
              size={20}
              color={liked ? "#ef4444" : "#6b7280"}
              fill={liked ? "#ef4444" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} className="p-1">
            <Bookmark
              size={20}
              color={saved ? "#3b82f6" : "#6b7280"}
              fill={saved ? "#3b82f6" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="p-1">
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
