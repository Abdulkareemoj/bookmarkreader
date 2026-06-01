import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
	Archive,
	Bookmark,
	ChevronRight,
	Heart,
	Home,
	Inbox,
	Star,
	X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCollectionsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddBookmarkModal } from "./add-bookmark-modal";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface CollectionsBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function CollectionsBottomSheet({
	isOpen,
	onClose,
	activeTab,
	onTabChange,
}: CollectionsBottomSheetProps) {
	const { bookmarkCollections } = useCollectionsStore();
	const { addBookmark } = useBookmarks();
	const bottomSheetRef = useRef<BottomSheet>(null);

	const snapPoints = useMemo(() => ["60%", "80%"], []);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				onClose();
			}
		},
		[onClose],
	);

	React.useEffect(() => {
		const ref = bottomSheetRef.current;
		if (!ref) return;
		if (isOpen) {
			ref.snapToIndex(0);
		} else {
			ref.close();
		}
	}, [isOpen]);

	const navigateTo = (href: "/bookmarks/favorites" | "/bookmarks/archive") => {
		onClose();
		router.navigate(href);
	};

	const getCollectionIcon = (id: string) => {
		switch (id) {
			case "all":
				return Home;
			case "inbox":
				return Inbox;
			case "liked":
				return Heart;
			case "saved":
				return Bookmark;
			default:
				return ChevronRight;
		}
	};

	const navItems = [
		{ id: "favorites", name: "Favorites", icon: Star, href: "/bookmarks/favorites" as const },
		{ id: "archive", name: "Archive", icon: Archive, href: "/bookmarks/archive" as const },
	];

	const collections = [
		{ id: "all", name: "All Bookmarks" },
		{ id: "liked", name: "Liked" },
		{ id: "saved", name: "Saved" },
		...bookmarkCollections.filter((c) => c.id !== "all" && c.id !== "inbox"),
	];

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			snapPoints={snapPoints}
			enablePanDownToClose={true}
			onChange={handleSheetChanges}
			backgroundStyle={{
				backgroundColor: "hsl(var(--background))",
			}}
			handleIndicatorStyle={{
				backgroundColor: "hsl(var(--muted-foreground))",
				width: 40,
				height: 4,
			}}
			handleStyle={{
				paddingTop: 8,
				paddingBottom: 4,
			}}
		>
			<BottomSheetView className="flex-1">
				<View className="flex-row justify-center py-2">
					<View className="h-1 w-12 rounded-full bg-muted-foreground/30" />
				</View>

				<View className="flex-row items-center justify-between border-border border-b px-6 py-4">
					<Text className="font-bold text-foreground text-xl">Collections</Text>
					<TouchableOpacity
						onPress={onClose}
						className="rounded-full bg-accent p-2"
					>
						<X size={20} className="text-muted-foreground" />
					</TouchableOpacity>
				</View>

				<ScrollView className="flex-1 px-4 py-4">
					<Text className="mb-4 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						Views
					</Text>
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<TouchableOpacity
								key={item.id}
								onPress={() => navigateTo(item.href)}
								className="mb-2 flex-row items-center rounded-xl px-4 py-3 active:bg-accent"
							>
								<Icon size={20} className="text-muted-foreground" />
								<Text className="ml-3 font-semibold text-foreground">
									{item.name}
								</Text>
							</TouchableOpacity>
						);
					})}

					<Text className="mb-4 mt-6 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						Filters
					</Text>
					{collections.map((collection) => {
						const Icon = getCollectionIcon(collection.id);
						const isActive = activeTab === collection.id;

						return (
							<TouchableOpacity
								key={collection.id}
								onPress={() => {
									onTabChange(collection.id);
									onClose();
								}}
								className={cn(
									"mb-2 flex-row items-center rounded-xl px-4 py-3",
									isActive ? "bg-primary/10" : "active:bg-accent",
								)}
							>
								<Icon
									size={20}
									className={cn(
										isActive ? "text-primary" : "text-muted-foreground",
									)}
								/>
								<Text
									className={cn(
										"ml-3 font-semibold",
										isActive ? "text-primary" : "text-foreground",
									)}
								>
									{collection.name}
								</Text>
							</TouchableOpacity>
						);
					})}

					<View className="mt-6">
						<Text className="font-medium text-foreground mb-3">Add New Bookmark</Text>
						<AddBookmarkModal
							onAddBookmark={(data) => {
								addBookmark({
									...data,
									tags: [],
								});
								onClose();
							}}
						/>
					</View>
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	);
}
