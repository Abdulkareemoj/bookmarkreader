import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Download, Monitor, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useReaderStore, useSettingsStore } from "@/lib/store";
import { exportSyncData, importSyncData } from "@/lib/sync";

export const Route = createFileRoute("/settings")({
	component: SettingsComponent,
});

function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
	const isDark = mode === "dark" || mode === "system";
	return (
		<div
			className={`relative h-20 w-full overflow-hidden rounded-lg ${isDark ? "bg-[oklch(0.15_0.02_260)]" : "bg-[oklch(0.92_0.01_260)]"}`}
		>
			{/* Title bar */}
			<div
				className={`mx-3 mt-3 h-2 w-12 rounded-full ${isDark ? "bg-[oklch(0.35_0.015_260)]" : "bg-[oklch(0.78_0.01_260)]"}`}
			/>
			{/* Content lines */}
			<div className="mx-3 mt-2 flex gap-2">
				<div
					className={`h-8 w-10 rounded ${isDark ? "bg-[oklch(0.25_0.02_250)]" : "bg-[oklch(0.82_0.02_250)]"}`}
				/>
				<div className="flex-1 space-y-1.5">
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
					<Monitor className="h-6 w-6 text-muted-foreground/50" />
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
		<div className="flex items-center justify-between border-border border-b py-4 last:border-b-0">
			<div className="space-y-0.5">
				<p className="font-medium text-sm">{label}</p>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}

function SectionHeader({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="mb-1 pt-6 first:pt-0">
			<h2 className="font-semibold text-lg">{title}</h2>
			{description && (
				<p className="mt-0.5 text-muted-foreground text-sm">{description}</p>
			)}
		</div>
	);
}

function SettingsComponent() {
	const { theme, setTheme } = useTheme();
	const setReaderTheme = useReaderStore((state) => state.setTheme);
	const { syncStatus, setSyncStatus } = useSettingsStore();

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

	const themes = [
		{
			value: "system",
			label: "System default",
			desc: "Automatic based on device settings",
		},
		{
			value: "light",
			label: "Light mode",
			desc: "Always use the light appearance",
		},
		{
			value: "dark",
			label: "Dark mode",
			desc: "Always use the dark appearance",
		},
	] as const;

	return (
		<div className="min-h-screen bg-background">
			<div className="p-6">
				<h1 className="truncate font-semibold text-2xl text-foreground">
					Settings
				</h1>
				<p className="mt-1 text-muted-foreground">
					Discover content and insights from your feeds
				</p>
			</div>
			<div className="mx-auto max-w-4xl px-6 py-10">
				{/* Theme */}
				<div id="theme">
					<SectionHeader
						title="Theme"
						description="Automatic based on device settings"
					/>
					<div className="mt-3 grid grid-cols-3 gap-3">
						{themes.map((t) => {
							const isActive = theme === t.value;
							return (
								<RadioGroup value={theme} onValueChange={handleThemeChange}>
									<div
										key={t.value}
										className={`cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
											isActive
												? "border-primary bg-primary/10"
												: "border-border bg-card hover:bg-accent"
										}`}
									>
										<Label className="block cursor-pointer" htmlFor={t.value}>
											<ThemePreview mode={t.value} />
											<div className="mt-2 flex items-center justify-between">
												<div>
													<p className="font-medium text-xs">{t.label}</p>
													<p className="mt-0.5 text-[10px] text-muted-foreground">
														{t.desc}
													</p>
												</div>
												<RadioGroupItem value={t.value} id={t.value} />
											</div>
										</Label>
									</div>
								</RadioGroup>
							);
						})}
					</div>
				</div>

				{/* Sync */}
				<div id="sync" className="mt-6">
					<SectionHeader title="Sync Data" />
					<div className="mt-1 rounded-xl border border-border bg-card">
						<div className="px-4">
							<SettingRow
								label="Status"
								description={
									syncStatus === "connected"
										? lastSync
											? `Last: ${new Date(lastSync).toLocaleDateString()}`
											: "Ready"
										: syncStatus
								}
							>
								<span
									className={`inline-flex items-center gap-1.5 font-medium text-xs ${
										syncStatus === "connected"
											? "text-green-400"
											: syncStatus === "error"
												? "text-destructive"
												: "text-muted-foreground"
									}`}
								>
									<Cloud className="h-3.5 w-3.5" />
									{syncStatus}
								</span>
							</SettingRow>

							<SettingRow
								label="Export"
								description="Download your data as JSON"
							>
								<Button
									onClick={handleExport}
									className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-accent"
								>
									<Download className="h-3.5 w-3.5" />
									Export
								</Button>
							</SettingRow>

							<SettingRow
								label="Import"
								description="Load data from a JSON file"
							>
								<Button
									onClick={handleImport}
									className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-accent"
								>
									<Upload className="h-3.5 w-3.5" />
									Import
								</Button>
							</SettingRow>

							<SettingRow
								label="Import Mode"
								description="How to handle existing data"
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
						</div>
					</div>
				</div>

				{/* About */}
				<div id="about" className="mt-6">
					<SectionHeader title="About" />
					<div className="mt-1 rounded-xl border border-border bg-card">
						<div className="px-4">
							<SettingRow label="Version">
								<span className="text-muted-foreground text-xs">1.0.0</span>
							</SettingRow>
							<SettingRow label="Build">
								<span className="text-muted-foreground text-xs">
									2024.04.12
								</span>
							</SettingRow>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
