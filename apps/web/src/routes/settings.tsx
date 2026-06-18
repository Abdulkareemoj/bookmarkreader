import { createFileRoute } from "@tanstack/react-router";
import {
	Cloud,
	Download,
	Monitor,
	TextSearch,
	Trash2,
	Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/lib/store";
import { exportSyncData, importSyncData } from "@/lib/sync";

export const Route = createFileRoute("/settings")({
	component: SettingsComponent,
});

const FONT_SIZES = [
	{ value: "sm", label: "Small", desc: "Compact reading" },
	{ value: "md", label: "Medium", desc: "Default size" },
	{ value: "lg", label: "Large", desc: "Easier reading" },
] as const;

function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
	const isDark = mode === "dark" || mode === "system";
	return (
		<div
			className={`relative h-20 w-full overflow-hidden rounded-lg ${isDark ? "bg-[oklch(0.15_0.02_260)]" : "bg-[oklch(0.92_0.01_260)]"}`}
		>
			<div
				className={`mx-3 mt-3 h-2 w-12 rounded-full ${isDark ? "bg-[oklch(0.35_0.015_260)]" : "bg-[oklch(0.78_0.01_260)]"}`}
			/>
			<div className="mx-3 mt-2 flex gap-2">
				<div
					className={`h-8 w-10 rounded ${isDark ? "bg-[oklch(0.25_0.02_250)]" : "bg-[oklch(0.82_0.02_250)]"}`}
				/>
				<div className="flex flex-col gap-1.5">
					<div
						className={`h-1.5 w-full rounded-full ${isDark ? "bg-[oklch(0.3_0.015_260)]" : "bg-[oklch(0.82_0.01_260)]"}`}
					/>
					<div
						className={`h-1.5 w-3/4 rounded-full ${isDark ? "bg-[oklch(0.3_0.015_260)]" : "bg-[oklch(0.82_0.01_260)]"}`}
					/>
					<div
						className={`h-1.5 w-1/2 rounded-full ${isDark ? "bg-[oklch(0.3_0.015_260)]" : "bg-[oklch(0.82_0.01_260)]"}`}
					/>
				</div>
			</div>
			{mode === "system" && (
				<div className="absolute inset-0 flex items-center justify-center">
					<Monitor className="size-6 text-muted-foreground/50" />
				</div>
			)}
		</div>
	);
}

function SettingRow({
	label,
	description,
	children,
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
			<div className="flex flex-col gap-0.5">
				<p className="font-medium text-sm">{label}</p>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}

function SettingsComponent() {
	const { theme, setTheme } = useTheme();
	const setReaderTheme = useSettingsStore((state) => state.setTheme);
	const { syncStatus, setSyncStatus, readerFontSize, setReaderFontSize } =
		useSettingsStore();

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
				window.location.reload();
			} catch (err) {
				console.error("Import failed:", err);
				setSyncStatus("error");
			}
		};
		input.click();
	};

	const handleThemeChange = (value: string) => {
		setTheme(value as "light" | "dark" | "system");
		if (value !== "system") {
			setReaderTheme(value as "light" | "dark");
		}
	};

	const handleClearCache = () => {
		if (typeof indexedDB !== "undefined") {
			const req = indexedDB.deleteDatabase("bookmark_tool_web");
			req.onsuccess = () => window.location.reload();
			req.onerror = () => console.error("Failed to clear cache");
		}
	};

	const themes = [
		{
			value: "system",
			label: "System default",
			desc: "Follows device settings",
		},
		{
			value: "light",
			label: "Light mode",
			desc: "Bright and clean",
		},
		{
			value: "dark",
			label: "Dark mode",
			desc: "Easy on the eyes",
		},
	] as const;

	return (
		<div className="min-h-screen bg-background">
			<div className="p-6">
				<h1 className="truncate font-semibold text-2xl text-foreground">
					Settings
				</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your reading experience and data
				</p>
			</div>
			<div className="mx-auto max-w-4xl px-6 pb-20">
				{/* Theme */}
				<Card id="theme">
					<CardHeader>
						<CardTitle>Theme</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-3">
							{themes.map((t) => {
								const isActive = theme === t.value;
								return (
									<div key={t.value}>
										<RadioGroup value={theme} onValueChange={handleThemeChange}>
											<Label
												className={`block cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
													isActive
														? "border-primary bg-primary/10"
														: "border-border bg-card hover:bg-accent"
												}`}
											>
												<ThemePreview mode={t.value} />
												<div className="mt-2 flex items-center justify-between">
													<div>
														<p className="font-medium text-xs">{t.label}</p>
														<p className="mt-0.5 text-[10px] text-muted-foreground">
															{t.desc}
														</p>
													</div>
													<RadioGroupItem value={t.value} />
												</div>
											</Label>
										</RadioGroup>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Reading */}
				<Card id="reading" className="mt-8">
					<CardHeader>
						<CardTitle>Reading</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-medium text-sm">Font Size</div>
						<RadioGroup
							value={readerFontSize}
							onValueChange={(v) => setReaderFontSize(v as "sm" | "md" | "lg")}
							className="mt-3 flex gap-2"
						>
							{FONT_SIZES.map((fs) => {
								const isActive = readerFontSize === fs.value;
								return (
									<Label
										key={fs.value}
										className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all ${
											isActive
												? "border-primary bg-primary/10"
												: "border-border hover:bg-accent"
										}`}
									>
										<TextSearch className="size-4 text-muted-foreground" />
										<p className="font-medium text-xs">{fs.label}</p>
										<p className="text-[10px] text-muted-foreground">
											{fs.desc}
										</p>
										<RadioGroupItem value={fs.value} />
									</Label>
								);
							})}
						</RadioGroup>
					</CardContent>
				</Card>

				{/* Data */}
				<Card id="data" className="mt-8">
					<CardHeader>
						<CardTitle>Data Management</CardTitle>
					</CardHeader>
					<CardContent>
						<SettingRow
							label="Clear Cache"
							description="Remove all locally cached data. Feeds and bookmarks are preserved."
						>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleClearCache}
								className="gap-1.5"
							>
								<Trash2 className="size-3.5" />
								Clear
							</Button>
						</SettingRow>
					</CardContent>
				</Card>

				{/* Sync */}
				<Card id="sync" className="mt-8">
					<CardHeader>
						<CardTitle>Sync Data</CardTitle>
					</CardHeader>
					<CardContent>
						<SettingRow
							label="Status"
							description={
								syncStatus === "connected"
									? lastSync
										? `Last sync: ${new Date(lastSync).toLocaleDateString()}`
										: "Ready"
									: syncStatus === "error"
										? "Last attempt failed"
										: ""
							}
						>
							<span
								className={`inline-flex items-center gap-1.5 font-medium text-xs ${
									syncStatus === "connected"
										? "text-green-500"
										: syncStatus === "error"
											? "text-destructive"
											: "text-muted-foreground"
								}`}
							>
								<Cloud className="size-3.5" />
								{syncStatus === "connected"
									? "Connected"
									: syncStatus === "syncing"
										? "Syncing..."
										: syncStatus === "error"
											? "Error"
											: "Idle"}
							</span>
						</SettingRow>

						<Separator className="my-1" />

						<SettingRow
							label="Export"
							description="Download all data as a JSON file"
						>
							<Button
								onClick={handleExport}
								variant="outline"
								size="sm"
								className="gap-1.5"
							>
								<Download className="size-3.5" />
								Export
							</Button>
						</SettingRow>

						<Separator className="my-1" />

						<SettingRow label="Import" description="Load data from a JSON file">
							<Button
								onClick={handleImport}
								variant="outline"
								size="sm"
								className="gap-1.5"
							>
								<Upload className="size-3.5" />
								Import
							</Button>
						</SettingRow>

						<Separator className="my-1" />

						<SettingRow
							label="Import Mode"
							description="Merge adds to existing data; Replace overwrites"
						>
							<RadioGroup
								value={importMode}
								onValueChange={(v) => setImportMode(v as "merge" | "replace")}
								className="flex gap-3"
							>
								<div className="flex items-center gap-1.5">
									<RadioGroupItem value="merge" id="merge" />
									<Label htmlFor="merge" className="cursor-pointer text-xs">
										Merge
									</Label>
								</div>
								<div className="flex items-center gap-1.5">
									<RadioGroupItem value="replace" id="replace" />
									<Label htmlFor="replace" className="cursor-pointer text-xs">
										Replace
									</Label>
								</div>
							</RadioGroup>
						</SettingRow>
					</CardContent>
				</Card>

				{/* About */}
				<Card id="about" className="mt-8">
					<CardHeader>
						<CardTitle>About</CardTitle>
					</CardHeader>
					<CardContent>
						<SettingRow label="Version">
							<span className="text-muted-foreground text-xs">1.0.0</span>
						</SettingRow>
						<Separator className="my-1" />
						<SettingRow label="Build">
							<span className="text-muted-foreground text-xs">2024.04.12</span>
						</SettingRow>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
