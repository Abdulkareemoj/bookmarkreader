import {
	Cloud,
	Download,
	Monitor,
	Moon,
	Sun,
	Upload,
} from "lucide-react-native";
import { useId, useState } from "react";
import { Alert } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useReaderStore, useSettingsStore } from "@/lib/store";
import { getInitializedAgents } from "@/lib/agents";

export default function Settings() {
	const { theme } = useUniwind();
	const setReaderTheme = useReaderStore((state) => state.setTheme);
	const { syncStatus, setSyncStatus } = useSettingsStore();

	const [offlineMode, setOfflineMode] = useState(false);
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
				copyToCache: true,
			});

			if (result.canceled || !result.assets?.[0]) return;

			setSyncStatus("syncing");
			const fileUri = result.assets[0].uri;
			const text = await FileSystem.readAsStringAsync(fileUri);
			const data = JSON.parse(text);

			// Import logic
			const agents = getInitializedAgents();

			if (importMode === "replace") {
				// Delete all existing first
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

	const _handleThemeChange = (value: string) => {
		Uniwind.setTheme(value as "light" | "dark" | "system");
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	return (
		<ScrollView className="flex-1 bg-background p-4">
			{/* Header */}
			<View className="mb-8">
				<Text className="text-base text-muted-foreground">
					Manage your application preferences and reading experience.
				</Text>
			</View>

			{/* Theme Selection Card */}
			<Card className="mb-6">
				<View className="p-6">
					<Text className="mb-4 font-semibold text-foreground text-lg">
						Appearance
					</Text>
					<Separator className="mb-4" />

					<RadioGroup value={theme} onValueChange={_handleThemeChange}>
						<View className="relative flex flex-row items-center justify-between rounded-md border border-input p-4 mb-3">
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

						<View className="relative flex flex-row items-center justify-between rounded-md border border-input p-4 mb-3">
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

						<View className="relative flex flex-row items-center justify-between rounded-md border border-input p-4">
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

			{/* Offline Mode Card */}
			<Card className="mb-6">
				<View className="p-6">
					<Text className="mb-4 font-semibold text-foreground text-lg">
						Offline Mode
					</Text>
					<Separator className="mb-4" />

					<View className="flex-row items-center justify-between">
						<View className="flex-1">
							<Label className="font-medium">Enable Offline Mode</Label>
							<Text className="text-muted-foreground text-sm">
								Use local storage only
							</Text>
						</View>
						<Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
					</View>
				</View>
			</Card>

			{/* Sync Card */}
			<Card className="mb-6">
				<View className="p-6">
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
											? `Last: ${new Date(lastSync).toLocaleDateString()}`
											: "Ready"
										: syncStatus}
								</Text>
							</View>
						</Badge>
					</View>
					<Separator className="mb-4" />

					<Text className="mb-4 text-muted-foreground text-sm">
						Export to a file and import on another device. Save to Google Drive,
						iCloud, OneDrive, or any cloud storage.
					</Text>

					<Button
						onPress={handleExport}
						disabled={syncStatus === "syncing"}
						className="w-full mb-3"
					>
						<Icon as={Upload} size={16} className="mr-2" />
						<Text className="text-primary-foreground">Export Data</Text>
					</Button>

					<Button
						onPress={handleImport}
						disabled={syncStatus === "syncing"}
						className="w-full mb-4"
						variant="outline"
					>
						<Icon as={Download} size={16} className="mr-2" />
						<Text className="text-primary-foreground">Import Data</Text>
					</Button>

					<View className="mb-2">
						<Text className="text-sm font-medium mb-2">Import Mode</Text>
						<RadioGroup
							value={importMode}
							onValueChange={(v) => setImportMode(v as "merge" | "replace")}
						>
							<View className="flex-row items-center gap-2 mr-4">
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

			{/* About Card */}
			<Card>
				<View className="p-6">
					<Text className="mb-4 font-semibold text-foreground text-lg">
						About
					</Text>
					<Separator className="mb-4" />

					<View className="space-y-3">
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
