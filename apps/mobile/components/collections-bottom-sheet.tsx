import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
	Bookmark,
	ChevronRight,
	Heart,
	Home,
	Inbox,
	LogOut,
	Settings,
	X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCollectionsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
	const bottomSheetRef = useRef<BottomSheet>(null);

	// Snap points
	const snapPoints = useMemo(() => ["60%", "80%"], []);

	// Handle sheet changes
	const handleSheetChanges = useCallback(
		(index: number) => {
			console.log("Bottom sheet index changed:", index);
			if (index === -1) {
				onClose();
			}
		},
		[onClose],
	);

	// Show/hide sheet based on isOpen prop
	React.useEffect(() => {
		console.log("Bottom sheet isOpen changed:", isOpen);
		if (isOpen && bottomSheetRef.current) {
			// Use a small delay to ensure the sheet is mounted
			setTimeout(() => {
				bottomSheetRef.current?.snapToIndex(0);
			}, 100);
		} else if (!isOpen && bottomSheetRef.current) {
			bottomSheetRef.current.close();
		}
	}, [isOpen]);

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

	// Combine default and user collections
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
				{/* Drag Handle Indicator */}
				<View className="flex-row justify-center py-2">
					<View className="h-1 w-12 rounded-full bg-muted-foreground/30" />
				</View>

				{/* Header */}
				<View className="flex-row items-center justify-between border-border border-b px-6 py-4">
					<Text className="font-bold text-foreground text-xl">Collections</Text>
					<TouchableOpacity
						onPress={onClose}
						className="rounded-full bg-accent p-2"
					>
						<X size={20} className="text-muted-foreground" />
					</TouchableOpacity>
				</View>

				{/* Collections List */}
				<ScrollView className="flex-1 px-4 py-4">
					<Text className="mb-4 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						Bookmark Collections
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

					{/* RSS Feeds Section */}
					<Text className="mt-6 mb-4 px-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
						RSS Feeds
					</Text>
					<TouchableOpacity
						onPress={() => {
							onTabChange("rss");
							onClose();
						}}
						className={cn(
							"mb-2 flex-row items-center rounded-xl px-4 py-3",
							activeTab === "rss" ? "bg-primary/10" : "active:bg-accent",
						)}
					>
						<Bookmark
							size={20}
							className={cn(
								activeTab === "rss" ? "text-primary" : "text-muted-foreground",
							)}
						/>
						<Text
							className={cn(
								"ml-3 font-semibold",
								activeTab === "rss" ? "text-primary" : "text-foreground",
							)}
						>
							All RSS Articles
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	);
}
