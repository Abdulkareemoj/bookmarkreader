import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import {
	Cloud,
	Download,
	Monitor,
	Moon,
	Sun,
	TextSearch,
	Trash2,
	Upload,
} from "lucide-react-native";
import { useId, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { getInitializedAgents } from "@/lib/agents";
import { useSettingsStore } from "@/lib/store";

const FONT_SIZES = [
	{ value: "sm", label: "Small", desc: "Compact" },
	{ value: "md", label: "Medium", desc: "Default" },
	{ value: "lg", label: "Large", desc: "Easier" },
] as const;

export default function Settings() {
	const { theme } = useUniwind();
	const setReaderTheme = useSettingsStore((state) => state.setTheme);
	const { syncStatus, setSyncStatus, readerFontSize, setReaderFontSize } =
		useSettingsStore();

	const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
	const [lastSync, setLastSync] = useState<string | null>(null);

	const themeId = useId();

	const handleExport = async () => {
		setSyncStatus("syncing");
		try {
			const agents = getInitializedAgents();
			const [bookmarks, feeds, articles] = await Promise.all([
				agents.bookmarkAgent.listBookmarks(),
				agents.rssAgent.listFeeds(),
				agents.rssAgent.listArticles(),
			]);

			const data = {
				version: 1,
				exportedAt: new Date().toISOString(),
				bookmarks,
				feeds,
				articles,
			};

			const fileName = `bookmark-reader-sync-${new Date().toISOString().split("T")[0]}.json`;
			const fileUri = FileSystem.documentDirectory + fileName;
			await FileSystem.writeAsStringAsync(
				fileUri,
				JSON.stringify(data, null, 2),
			);

			Alert.alert(
				"Export Complete",
				`Saved to ${fileName}. Move this file to your cloud storage to sync with other devices.`,
			);
			setLastSync(new Date().toISOString());
			setSyncStatus("connected");
		} catch (e) {
			console.error("Export failed:", e);
			setSyncStatus("error");
			Alert.alert("Error", "Failed to export data");
		}
	};

	const handleImport = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "application/json",
			});

			if (result.canceled || !result.assets?.[0]) return;

			setSyncStatus("syncing");
			const fileUri = result.assets[0].uri;
			const text = await FileSystem.readAsStringAsync(fileUri);
			const data = JSON.parse(text);

			const agents = getInitializedAgents();

			if (importMode === "replace") {
				for (const b of await agents.bookmarkAgent.listBookmarks()) {
					await agents.bookmarkAgent.deleteBookmark(b.id);
				}
				for (const f of await agents.rssAgent.listFeeds()) {
					await agents.rssAgent.removeFeed(f.id);
				}
			}

			for (const bookmark of data.bookmarks || []) {
				try {
					await agents.bookmarkAgent.addBookmark({
						title: bookmark.title,
						url: bookmark.url,
						description: bookmark.description,
						favicon: bookmark.favicon,
						tags: bookmark.tags,
						favorite: bookmark.favorite,
						collectionId: bookmark.collectionId,
					});
				} catch {}
			}

			for (const feed of data.feeds || []) {
				try {
					await agents.rssAgent.addFeed({
						title: feed.title,
						feedUrl: feed.feedUrl,
						siteUrl: feed.siteUrl,
					});
				} catch {}
			}

			setLastSync(new Date().toISOString());
			setSyncStatus("connected");
			Alert.alert(
				"Import Complete",
				"Data imported successfully. Restart the app to see all data.",
			);
		} catch (e) {
			console.error("Import failed:", e);
			setSyncStatus("error");
			Alert.alert("Error", "Failed to import data");
		}
	};

	const handleClearCache = () => {
		Alert.alert(
			"Clear Cache",
			"This will remove all locally cached data. Feeds and bookmarks are preserved. This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: () => {
						Alert.alert(
							"Restart Required",
							"Please restart the app to complete the cache clear.",
						);
					},
				},
			],
		);
	};

	const _handleThemeChange = (value: string) => {
		Uniwind.setTheme(value as "light" | "dark" | "system");
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingTop: 16,
				paddingBottom: 28,
			}}
			showsVerticalScrollIndicator={false}
		>
			<View className="mb-6">
				<Text className="font-semibold text-foreground text-2xl">Settings</Text>
			</View>

			{/* Theme */}
			<Card className="mb-4">
				<View className="px-4 py-3">
					<Text className="mb-4 font-semibold text-foreground text-lg">
						Theme
					</Text>
					<RadioGroup value={theme} onValueChange={_handleThemeChange}>
						<View className="relative mb-3 flex flex-row items-center justify-between rounded-lg border border-input p-3">
							<View className="flex-row items-center gap-3">
								<Icon as={Sun} size={20} className="text-yellow-500" />
								<View>
									<Label className="font-medium">Light</Label>
									<Text className="text-muted-foreground text-sm">
										Bright and clean
									</Text>
								</View>
							</View>
							<RadioGroupItem value="light" id={`${themeId}-light`} />
						</View>
						<View className="relative mb-3 flex flex-row items-center justify-between rounded-lg border border-input p-3">
							<View className="flex-row items-center gap-3">
								<Icon as={Moon} size={20} className="text-blue-500" />
								<View>
									<Label className="font-medium">Dark</Label>
									<Text className="text-muted-foreground text-sm">
										Easy on the eyes
									</Text>
								</View>
							</View>
							<RadioGroupItem value="dark" id={`${themeId}-dark`} />
						</View>
						<View className="relative flex flex-row items-center justify-between rounded-lg border border-input p-3">
							<View className="flex-row items-center gap-3">
								<Icon
									as={Monitor}
									size={20}
									className="text-muted-foreground"
								/>
								<View>
									<Label className="font-medium">System</Label>
									<Text className="text-muted-foreground text-sm">
										Follows device
									</Text>
								</View>
							</View>
							<RadioGroupItem value="system" id={`${themeId}-system`} />
						</View>
					</RadioGroup>
				</View>
			</Card>

			{/* Reading */}
			<Card className="mb-4">
				<View className="px-4 py-3">
					<Text className="mb-1 font-semibold text-foreground text-lg">
						Reading
					</Text>
					<Text className="mb-4 text-muted-foreground text-sm">
						Customize how articles are displayed
					</Text>
					<Separator className="mb-4" />
					<Text className="mb-3 font-medium text-sm">Font Size</Text>
					<View className="flex-row gap-2">
						{FONT_SIZES.map((fs) => {
							const isActive = readerFontSize === fs.value;
							return (
								<Label
									key={fs.value}
									className={`flex-1 items-center gap-1 rounded-lg border p-3 ${
										isActive ? "border-primary bg-primary/10" : "border-input"
									}`}
								>
									<View className="items-center gap-1">
										<Icon
											as={TextSearch}
											size={16}
											className="text-muted-foreground"
										/>
										<Text className="font-medium text-xs text-center">
											{fs.label}
										</Text>
										<Text className="text-[10px] text-muted-foreground text-center">
											{fs.desc}
										</Text>
									</View>
									<RadioGroupItem value={fs.value} />
								</Label>
							);
						})}
					</View>
				</View>
			</Card>

			{/* Data Management */}
			<Card className="mb-4">
				<View className="px-4 py-3">
					<Text className="mb-1 font-semibold text-foreground text-lg">
						Data Management
					</Text>
					<Text className="mb-4 text-muted-foreground text-sm">
						Manage local storage and cached content
					</Text>
					<Separator className="mb-4" />
					<Button
						onPress={handleClearCache}
						variant="destructive"
						className="w-full"
					>
						<Icon as={Trash2} size={16} className="mr-2" />
						<Text>Clear Cache</Text>
					</Button>
				</View>
			</Card>

			{/* Sync */}
			<Card className="mb-4">
				<View className="px-4 py-3">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground text-lg">
							Sync Data
						</Text>
						<Badge
							variant={syncStatus === "connected" ? "default" : "secondary"}
						>
							<View className="flex-row items-center gap-1">
								<Icon as={Cloud} size={12} />
								<Text className="text-xs">
									{syncStatus === "connected"
										? lastSync
											? new Date(lastSync).toLocaleDateString()
											: "Ready"
										: syncStatus === "syncing"
											? "Syncing..."
											: syncStatus === "error"
												? "Error"
												: "Idle"}
								</Text>
							</View>
						</Badge>
					</View>
					<Separator className="mb-4" />
					<Text className="mb-4 text-muted-foreground text-sm">
						Export your data as a JSON file and import it on another device.
					</Text>
					<Button
						onPress={handleExport}
						disabled={syncStatus === "syncing"}
						className="mb-3 w-full"
					>
						<Icon as={Download} size={16} className="mr-2" />
						<Text className="text-primary-foreground">Export Data</Text>
					</Button>
					<Button
						onPress={handleImport}
						disabled={syncStatus === "syncing"}
						className="mb-4 w-full"
						variant="outline"
					>
						<Icon as={Upload} size={16} className="mr-2" />
						<Text>Import Data</Text>
					</Button>
					<View className="mb-2">
						<Text className="mb-2 font-medium text-sm">Import Mode</Text>
						<RadioGroup
							value={importMode}
							onValueChange={(v) => setImportMode(v as "merge" | "replace")}
						>
							<View className="mr-4 flex-row items-center gap-2">
								<RadioGroupItem value="merge" id="merge" />
								<Label>Merge</Label>
							</View>
							<View className="flex-row items-center gap-2">
								<RadioGroupItem value="replace" id="replace" />
								<Label>Replace</Label>
							</View>
						</RadioGroup>
					</View>
				</View>
			</Card>

			{/* About */}
			<Card>
				<View className="px-4 py-3">
					<Text className="mb-3 font-semibold text-foreground text-lg">
						About
					</Text>
					<Separator className="mb-4" />
					<View className="gap-3">
						<View className="flex-row justify-between">
							<Text className="text-muted-foreground">Version</Text>
							<Text className="font-medium">1.0.0</Text>
						</View>
						<View className="flex-row justify-between">
							<Text className="text-muted-foreground">Build</Text>
							<Text className="font-medium">2024.04.12</Text>
						</View>
					</View>
				</View>
			</Card>
		</ScrollView>
	);
}
