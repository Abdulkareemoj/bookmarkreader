import {
	Bookmark,
	Edit,
	Heart,
	Link as LinkIcon,
	Trash2,
	Image as ImageIcon,
} from "lucide-react-native";
import { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface BookmarkCardProps {
	id: string;
	title: string;
	url: string;
	image?: string;
	liked: boolean;
	saved: boolean;
	onLike: () => void;
	onSave: () => void;
	onDelete: () => void;
	onOpenExternal?: () => void;
	onEdit?: () => void;
}

function BookmarkCard({
	id,
	title,
	url,
	image,
	liked,
	saved,
	onLike,
	onSave,
	onDelete,
	onOpenExternal,
	onEdit,
}: BookmarkCardProps) {
	return (
		<Pressable
			onPress={onOpenExternal}
			disabled={!onOpenExternal}
			className="mb-3 active:opacity-90"
		>
			<Card className="gap-0 overflow-hidden py-0">
				{/* Image Section */}
				{image ? (
					<Image
						source={{ uri: image }}
						className="h-36 w-full"
						resizeMode="cover"
						onError={() => {
							// Keep silent fallback behavior to avoid user-facing noise.
						}}
					/>
				) : (
					<View className="h-36 w-full items-center justify-center bg-muted">
						<ImageIcon size={30} className="text-muted-foreground" />
					</View>
				)}

				<CardContent className="p-3">
					

					<View className=" flex-row justify-between gap-2">
						<View className="flex-col  gap-2">
							<Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
								{title}
							</Text>
							<Text className="text-muted-foreground text-sm" numberOfLines={1}>
								{url}
							</Text>
						</View>
						<View className="flex-row items-center gap-2">
						{onEdit && (
							<Pressable onPress={onEdit} className="rounded-md p-2 active:bg-accent">
								<Edit size={18} className="text-muted-foreground" />
							</Pressable>
						)}
						<Pressable onPress={onLike} className="rounded-md p-2 active:bg-accent">
							<Heart
								size={18}
								color={liked ? "#ef4444" : "#6b7280"}
								fill={liked ? "#ef4444" : "none"}
							/>
						</Pressable>
						<Pressable onPress={onSave} className="rounded-md p-2 active:bg-accent">
							<Bookmark
								size={18}
								color={saved ? "#3b82f6" : "#6b7280"}
								fill={saved ? "#3b82f6" : "none"}
							/>
						</Pressable>
						<Pressable onPress={onDelete} className="rounded-md p-2 active:bg-accent">
							<Trash2 size={18} className="text-red-500" />
						</Pressable>
					</View></View>
				</CardContent>
			</Card>
		</Pressable>
	);
}

export default memo(BookmarkCard);
