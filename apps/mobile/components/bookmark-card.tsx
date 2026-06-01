import {
	Bookmark,
	Edit,
	ExternalLink,
	Heart,
	Trash2,
} from "lucide-react-native";
import { memo } from "react";
import { Image, Pressable, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface BookmarkCardProps {
	id: string;
	title: string;
	url: string;
	favicon?: string;
	tags?: string[];
	liked: boolean;
	saved: boolean;
	onLike: () => void;
	onSave: () => void;
	onDelete: () => void;
	onOpenExternal?: () => void;
	onEdit?: () => void;
}

function BookmarkCard({
	title,
	url,
	favicon,
	tags,
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
				{/* Hero Area — Favicon centered on gradient */}
				<View className="h-32 w-full items-center justify-center bg-muted">
					{favicon ? (
						<View className="size-14 items-center justify-center rounded-2xl bg-background shadow-sm">
							<Image
								source={{ uri: favicon }}
								className="size-9"
								resizeMode="contain"
								onError={() => {
									// silent fallback
								}}
							/>
						</View>
					) : (
						<View className="size-14 items-center justify-center rounded-2xl bg-background shadow-sm">
							<ExternalLink size={28} className="text-muted-foreground" />
						</View>
					)}
				</View>

				<View className="gap-2 p-3">
					<View className="gap-1">
						<Text className="font-semibold text-foreground" numberOfLines={2}>
							{title}
						</Text>
						<Text className="text-muted-foreground text-sm" numberOfLines={1}>
							{url}
						</Text>
					</View>

					{tags && tags.length > 0 && (
						<View className="flex-row flex-wrap gap-1">
							{tags.slice(0, 3).map((tag) => (
								<View
									key={tag}
									className="rounded-md bg-secondary px-1.5 py-0.5"
								>
									<Text className="text-secondary-foreground text-[10px] font-medium">
										{tag}
									</Text>
								</View>
							))}
							{tags.length > 3 && (
								<Text className="py-0.5 text-[10px] text-muted-foreground">
									+{tags.length - 3} more
								</Text>
							)}
						</View>
					)}

					{/* Action Row */}
					<View className="mt-1 flex-row items-center gap-2">
						{onEdit && (
							<Pressable
								onPress={onEdit}
								className="rounded-md p-2 active:bg-accent"
							>
								<Edit size={16} className="text-muted-foreground" />
							</Pressable>
						)}
						<Pressable
							onPress={onLike}
							className="rounded-md p-2 active:bg-accent"
						>
							<Heart
								size={16}
								color={liked ? "#ef4444" : "#6b7280"}
								fill={liked ? "#ef4444" : "none"}
							/>
						</Pressable>
						<Pressable
							onPress={onSave}
							className="rounded-md p-2 active:bg-accent"
						>
							<Bookmark
								size={16}
								color={saved ? "#3b82f6" : "#6b7280"}
								fill={saved ? "#3b82f6" : "none"}
							/>
						</Pressable>
						<Pressable
							onPress={onDelete}
							className="rounded-md p-2 active:bg-accent"
						>
							<Trash2 size={16} className="text-red-500" />
						</Pressable>
					</View>
				</View>
			</Card>
		</Pressable>
	);
}

export default memo(BookmarkCard);
