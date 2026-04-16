import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { exportSyncData, importSyncData } from "@/lib/sync";
import { useReaderStore, useSettingsStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
	component: SettingsComponent,
});

function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
	const isDark = mode === "dark" || mode === "system";
	return (
		<div
			className={`relative h-20 w-full rounded-lg overflow-hidden ${isDark ? "bg-[oklch(0.15_0.02_260)]" : "bg-[oklch(0.92_0.01_260)]"}`}
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
		<div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
			<div className="space-y-0.5">
				<p className="text-sm font-medium">{label}</p>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
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
			<h2 className="text-lg font-semibold">{title}</h2>
			{description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
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
		{ value: "system", label: "System default", desc: "Automatic based on device settings" },
		{ value: "light", label: "Light mode", desc: "Always use the light appearance" },
		{ value: "dark", label: "Dark mode", desc: "Always use the dark appearance" },
	] as const;

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl px-6 py-10">
				{/* Theme */}
				<div id="theme">
					<SectionHeader title="Theme" description="Automatic based on device settings" />
					<div className="grid grid-cols-3 gap-3 mt-3">
						{themes.map((t) => {
							const isActive = theme === t.value;
							return (
								<button
									key={t.value}
									onClick={() => handleThemeChange(t.value)}
									className={`rounded-xl p-2.5 text-left transition-all border ${
										isActive ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent"
									}`}
								>
									<ThemePreview mode={t.value} />
									<div className="mt-2 flex items-center justify-between">
										<div>
											<p className="text-xs font-medium">{t.label}</p>
											<p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
										</div>
										<Switch
											checked={isActive}
											onCheckedChange={() => handleThemeChange(t.value)}
											className="scale-75"
										/>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Sync */}
				<div id="sync" className="mt-6">
					<SectionHeader title="Sync Data" />
					<div className="mt-1 rounded-xl bg-card border border-border">
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
									className={`inline-flex items-center gap-1.5 text-xs font-medium ${
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

							<SettingRow label="Export" description="Download your data as JSON">
								<button
									onClick={handleExport}
									className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
								>
									<Download className="h-3.5 w-3.5" />
									Export
								</button>
							</SettingRow>

							<SettingRow label="Import" description="Load data from a JSON file">
								<button
									onClick={handleImport}
									className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
								>
									<Upload className="h-3.5 w-3.5" />
									Import
								</button>
							</SettingRow>

							<SettingRow label="Import Mode" description="How to handle existing data">
								<RadioGroup
									value={importMode}
									onValueChange={(v) => setImportMode(v as "merge" | "replace")}
									className="flex gap-3"
								>
									<div className="flex items-center gap-1.5">
										<RadioGroupItem value="merge" id="merge" />
										<Label htmlFor="merge" className="text-xs cursor-pointer">
											Merge
										</Label>
									</div>
									<div className="flex items-center gap-1.5">
										<RadioGroupItem value="replace" id="replace" />
										<Label htmlFor="replace" className="text-xs cursor-pointer">
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
					<div className="mt-1 rounded-xl bg-card border border-border">
						<div className="px-4">
							<SettingRow label="Version">
								<span className="text-xs text-muted-foreground">1.0.0</span>
							</SettingRow>
							<SettingRow label="Build">
								<span className="text-xs text-muted-foreground">2024.04.12</span>
							</SettingRow>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
