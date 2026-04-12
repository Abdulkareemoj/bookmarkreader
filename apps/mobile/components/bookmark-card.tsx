import {
	Bookmark,
	Edit,
	Heart,
	Link as LinkIcon,
	Trash2,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";

interface BookmarkCardProps {
	id: string;
	title: string;
	url: string;
	liked: boolean;
	saved: boolean;
	onLike: () => void;
	onSave: () => void;
	onDelete: () => void;
	onOpenExternal?: () => void;
	onEdit?: () => void;
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
	onOpenExternal,
	onEdit,
}: BookmarkCardProps) {
	return (
		<TouchableOpacity
			onPress={onOpenExternal}
			disabled={!onOpenExternal}
			className="mb-4 rounded-lg border border-border bg-card p-4 active:opacity-80"
		>
			<View>
				<Text className="font-bold text-foreground text-lg">{title}</Text>
			</View>
			<View className="mt-2 flex-row items-center gap-2">
				<LinkIcon size={16} className="text-muted-foreground" />
				<Text className="flex-1 truncate text-muted-foreground text-sm">
					{url}
				</Text>
			</View>

			{/* Actions */}
			<View className="mt-4 flex-row justify-end gap-4">
				{onEdit && (
					<TouchableOpacity onPress={onEdit} className="p-1">
						<Edit size={20} className="text-muted-foreground" />
					</TouchableOpacity>
				)}
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
					<Trash2 size={20} className="text-red-500" />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
}
