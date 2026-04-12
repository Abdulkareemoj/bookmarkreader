import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { exportSyncData, importSyncData } from "@/lib/sync";
import { useReaderStore, useSettingsStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
	component: SettingsComponent,
});

function SettingsComponent() {
	const themeId = useId();
	const offlineId = useId();

	const { theme: systemTheme, setTheme } = useTheme();
	const setReaderTheme = useReaderStore((state) => state.setTheme);

	const { syncStatus, setSyncStatus } = useSettingsStore();

	const [offlineMode, setOfflineMode] = useState(false);
	const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
	const [lastSync, setLastSync] = useState<string | null>(null);

	const handleExport = async () => {
		setSyncStatus("syncing");
		try {
			const data = await exportSyncData();
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `bookmark-reader-sync-${new Date().toISOString().split("T")[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
			setLastSync(new Date().toISOString());
			setSyncStatus("connected");
		} catch (e) {
			console.error("Export failed:", e);
			setSyncStatus("error");
		}
	};

	const handleImport = async () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			setSyncStatus("syncing");
			try {
				const text = await file.text();
				const data = JSON.parse(text);
				await importSyncData(data, importMode);
				setLastSync(new Date().toISOString());
				setSyncStatus("connected");
				// Reload to pick up new data
				window.location.reload();
			} catch (err) {
				console.error("Import failed:", err);
				setSyncStatus("error");
			}
		};
		input.click();
	};

	const handleThemeChange = (value: string) => {
		setTheme(value);
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl p-4 md:p-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl text-foreground">Settings</h1>
				<p className="text-muted-foreground">
					Manage your application preferences and reading experience.
				</p>
			</div>

			{/* Theme Selection Card */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-lg">Appearance</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Separator />

					<RadioGroup
						value={systemTheme}
						onValueChange={handleThemeChange}
						className="flex flex-col space-y-3"
					>
						{/* Light Theme */}
						<div className="relative flex flex-row items-center justify-between rounded-md border border-input p-4 has-data-[state=checked]:border-primary/50">
							<div className="flex items-center gap-3">
								<Sun className="text-yellow-500" />
								<div>
									<Label className="cursor-pointer font-medium">Light</Label>
									<p className="text-muted-foreground text-sm">
										Bright and clean interface
									</p>
								</div>
							</div>
							<RadioGroupItem value="light" id={`${themeId}-light`} />
						</div>

						{/* Dark Theme */}
						<div className="relative flex flex-row items-center justify-between rounded-md border border-input p-4 has-data-[state=checked]:border-primary/50">
							<div className="flex items-center gap-3">
								<Moon className="text-blue-500" />
								<div>
									<Label className="cursor-pointer font-medium">Dark</Label>
									<p className="text-muted-foreground text-sm">
										Easy on the eyes
									</p>
								</div>
							</div>
							<RadioGroupItem value="dark" id={`${themeId}-dark`} />
						</div>

						{/* System Theme */}
						<div className="relative flex flex-row items-center justify-between rounded-md border border-input p-4 has-data-[state=checked]:border-primary/50">
							<div className="flex items-center gap-3">
								<Monitor className="text-muted-foreground" />
								<div>
									<Label className="cursor-pointer font-medium">System</Label>
									<p className="text-muted-foreground text-sm">
										Follows device settings
									</p>
								</div>
							</div>
							<RadioGroupItem value="system" id={`${themeId}-system`} />
						</div>
					</RadioGroup>
				</CardContent>
			</Card>

			{/* Offline Mode Card */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-lg">Offline Mode</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Separator />

					<div className="flex items-center justify-between">
						<div className="flex-1">
							<Label htmlFor={offlineId} className="cursor-pointer font-medium">
								Enable Offline Mode
							</Label>
							<p className="text-muted-foreground text-sm">
								Use local storage only and disable network requests
							</p>
						</div>
						<Switch
							id={offlineId}
							checked={offlineMode}
							onCheckedChange={setOfflineMode}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Sync Card */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Sync Data</CardTitle>
						<Badge
							variant={syncStatus === "connected" ? "default" : "secondary"}
						>
							<div className="flex items-center gap-1">
								<Cloud className="h-3 w-3" />
								<span className="text-xs">
									{syncStatus === "connected"
										? lastSync
											? `Last: ${new Date(lastSync).toLocaleDateString()}`
											: "Ready"
										: syncStatus}
								</span>
							</div>
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<Separator />

					<p className="text-muted-foreground text-sm">
						Export your data to a file and import it on another device. Save the
						file to Google Drive, iCloud, OneDrive, or any cloud storage to sync
						across devices.
					</p>

					{/* Export Button */}
					<Button
						onClick={handleExport}
						disabled={syncStatus === "syncing"}
						className="w-full"
						variant="outline"
					>
						<Upload className="mr-2 h-4 w-4" />
						Export Data
					</Button>

					{/* Import Button */}
					<Button
						onClick={handleImport}
						disabled={syncStatus === "syncing"}
						className="w-full"
						variant="outline"
					>
						<Download className="mr-2 h-4 w-4" />
						Import Data
					</Button>

					{/* Import Mode Selection */}
					<div className="space-y-2">
						<p className="text-sm font-medium">Import Mode</p>
						<RadioGroup
							value={importMode}
							onValueChange={(v) => setImportMode(v as "merge" | "replace")}
							className="flex gap-4"
						>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="merge" id="merge" />
								<Label htmlFor="merge" className="cursor-pointer">
									Merge (add new items)
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="replace" id="replace" />
								<Label htmlFor="replace" className="cursor-pointer">
									Replace (clear first)
								</Label>
							</div>
						</RadioGroup>
					</div>
				</CardContent>
			</Card>

			{/* About Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">About</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Separator />

					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Version</span>
							<span className="font-medium">1.0.0</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Build</span>
							<span className="font-medium">2024.04.12</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
