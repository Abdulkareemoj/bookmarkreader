import { createFileRoute } from "@tanstack/react-router";
import {
  Cloud,
  Download,
  GitMerge,
  LogOut,
  Monitor,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
  AlertCircle,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getInitializedAgents } from "@/lib/agents";
import { useSettingsStore } from "@/lib/store";
import { exportSyncData, importSyncData } from "@/lib/sync";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

// ─── Static data ───────────────────────────────────────────────────────────────

const FONT_SIZES = [
  { value: "sm", label: "Small", sample: "Aa", px: 14 },
  { value: "md", label: "Medium", sample: "Aa", px: 16 },
  { value: "lg", label: "Large", sample: "Aa", px: 19 },
] as const;

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

// ─── Small building blocks ─────────────────────────────────────────────────────

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg text-foreground">{title}</h2>
      <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Row({
  label,
  description,
  children,
  last,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 py-4",
        !last && "border-b border-border/60"
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function StatusDot({ status }: { status: "connected" | "syncing" | "error" | "idle" }) {
  const color =
    status === "connected"
      ? "bg-green-500"
      : status === "error"
        ? "bg-destructive"
        : status === "syncing"
          ? "bg-amber-500 animate-pulse"
          : "bg-muted-foreground/40";
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", color)} />;
}

// ─── Theme card ───────────────────────────────────────────────────────────────

function ThemeOption({
  value,
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onSelect: () => void;
}) {
  const isDark = value === "dark";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all",
        active
          ? "border-foreground ring-1 ring-foreground"
          : "border-border hover:border-foreground/40"
      )}
    >
      <div
        className={cn(
          "relative h-16 w-full overflow-hidden rounded-lg",
          value === "system"
            ? "bg-gradient-to-br from-[oklch(0.92_0.01_260)] to-[oklch(0.18_0.02_260)]"
            : isDark
              ? "bg-[oklch(0.16_0.015_260)]"
              : "bg-[oklch(0.94_0.005_260)]"
        )}
      >
        <div
          className={cn(
            "absolute top-2.5 left-2.5 h-1.5 w-7 rounded-full",
            isDark || value === "system" ? "bg-white/20" : "bg-black/15"
          )}
        />
        <div className="absolute top-5.5 left-2.5 flex flex-col gap-1">
          <div
            className={cn(
              "h-1 w-10 rounded-full",
              isDark || value === "system" ? "bg-white/15" : "bg-black/10"
            )}
          />
          <div
            className={cn(
              "h-1 w-7 rounded-full",
              isDark || value === "system" ? "bg-white/15" : "bg-black/10"
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-xs">{label}</span>
        </div>
        {active && (
          <div className="flex size-4 items-center justify-center rounded-full bg-foreground">
            <Check className="size-2.5 text-background" />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function SettingsComponent() {
  const { theme, setTheme } = useTheme();
  const setReaderTheme = useSettingsStore((state) => state.setTheme);
  const {
    syncStatus,
    setSyncStatus,
    readerFontSize,
    setReaderFontSize,
    isAuthenticated,
    authEmail,
    setAuth,
    clearAuth,
  } = useSettingsStore();

  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ title: string; message: string } | null>(null);
  const id = useId();

  // ── Handlers (unchanged logic) ──────────────────────────────────────────────

  const handleExport = async () => {
    setSyncStatus("syncing");
    try {
      const data = await exportSyncData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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

  const handleSignIn = async () => {
    try {
      const agents = getInitializedAgents();
      const result = await agents.authAgent.signIn("gdrive");
      if (result.success) {
        const info = await agents.authAgent.getUserInfo();
        setAuth({ isAuthenticated: true, provider: "gdrive", email: info?.email ?? null });
      } else {
        setErrorDialog({
          title: "Unable to connect",
          message:
            result.error ??
            "Connection failed. Google Drive sync is only available on the desktop app.",
        });
      }
    } catch (e) {
      setErrorDialog({ title: "Connection error", message: (e as Error).message });
    }
  };

  const handleSignOut = async () => {
    try {
      const agents = getInitializedAgents();
      await agents.authAgent.signOut();
    } catch {
      /* ignore */
    }
    clearAuth();
  };

  useEffect(() => {
    if (isAuthenticated) return;
    const agents = getInitializedAgents();
    agents.authAgent.isSignedIn().then((signedIn) => {
      if (!signedIn) return;
      agents.authAgent.getUserInfo().then((info) => {
        setAuth({ isAuthenticated: true, provider: "gdrive", email: info?.email ?? null });
      });
    });
  }, []);

  const handleSyncNow = async () => {
    setSyncStatus("syncing");
    try {
      const { getReaderStore } = await import("@packages/store");
      const store = getReaderStore();
      if (!store) throw new Error("Store not initialized");
      const result = await store.getState().triggerSync();
      setSyncStatus(result.success ? "connected" : "error");
      setLastSync(result.syncedAt);
    } catch (e) {
      console.error("Sync failed:", e);
      setSyncStatus("error");
    }
  };

  const statusLabel =
    syncStatus === "connected" ? "Connected" : syncStatus === "syncing" ? "Syncing" : syncStatus === "error" ? "Error" : "Idle";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-6">
        <h1 className="font-semibold text-2xl text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your reading experience and data
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Content */}
        <div className="space-y-12">
          {/* Appearance */}
          <section>
            <SectionHeading
              title="Appearance"
              description="Choose how the app looks and how text is sized for reading"
            />

            <div className="space-y-8">
              <div>
                <p className="mb-3 font-medium text-sm">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map((t) => (
                    <ThemeOption
                      key={t.value}
                      value={t.value}
                      label={t.label}
                      icon={t.icon}
                      active={theme === t.value}
                      onSelect={() => handleThemeChange(t.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-medium text-sm">Reading font size</p>
                <div className="flex gap-2">
                  {FONT_SIZES.map((fs) => {
                    const active = readerFontSize === fs.value;
                    return (
                      <button
                        key={fs.value}
                        type="button"
                        onClick={() => setReaderFontSize(fs.value)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-4 transition-all",
                          active
                            ? "border-foreground ring-1 ring-foreground"
                            : "border-border hover:border-foreground/40"
                        )}
                      >
                        <span
                          className="font-medium text-foreground"
                          style={{ fontSize: fs.px }}
                        >
                          {fs.sample}
                        </span>
                        <span className="text-muted-foreground text-xs">{fs.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Data */}
          <section>
            <SectionHeading
              title="Data"
              description="Export, import, or clear data stored on this device"
            />

            <div>
              <Row label="Export data" description="Download everything as a JSON file" last={false}>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                  <Download className="size-3.5" />
                  Export
                </Button>
              </Row>
              <Row label="Import data" description="Load data from a previously exported file">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <RadioGroup
                    value={importMode}
                    onValueChange={(value) => setImportMode(value as "merge" | "replace")}
                    className="grid w-full max-w-md grid-cols-2 gap-3"
                  >
                    <label
                      htmlFor={`${id}-merge`}
                      className={cn(
                        "group relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-all",
                        importMode === "merge"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-foreground/50"
                      )}
                    >
                      <RadioGroupItem
                        value="merge"
                        id={`${id}-merge`}
                        className="order-1 size-5 [&_[data-slot=radio-group-indicator]>span]:size-2.5"
                        aria-describedby={`${id}-merge-description`}
                        aria-label="merge-import"
                      />
                      <div className="grid grow gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <GitMerge className="size-4" />
                          Merge
                        </div>
                        <p
                          id={`${id}-merge-description`}
                          className="text-muted-foreground text-xs"
                        >
                          Add imported bookmarks and feeds alongside your existing data.
                        </p>
                      </div>
                    </label>
                    <label
                      htmlFor={`${id}-replace`}
                      className={cn(
                        "group relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-all",
                        importMode === "replace"
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-foreground/50"
                      )}
                    >
                      <RadioGroupItem
                        value="replace"
                        id={`${id}-replace`}
                        className="order-1 size-5 [&_[data-slot=radio-group-indicator]>span]:size-2.5"
                        aria-describedby={`${id}-replace-description`}
                        aria-label="replace-import"
                      />
                      <div className="grid grow gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <RotateCcw className="size-4" />
                          Replace
                        </div>
                        <p
                          id={`${id}-replace-description`}
                          className="text-muted-foreground text-xs"
                        >
                          Replace existing data with the imported file.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                  <Button variant="outline" size="sm" onClick={handleImport} className="mt-3 gap-1.5 sm:mt-0 sm:ml-auto">
                    <Upload className="size-3.5" />
                    Import
                  </Button>
                </div>
              </Row>
              <Row
                label="Clear cache"
                description="Remove locally cached data, feeds and bookmarks are preserved"
                last
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </Row>
            </div>
          </section>

          <Separator />

          {/* Cloud sync */}
          <section>
            <SectionHeading
              title="Cloud sync"
              description="Keep bookmarks, feeds, and reading progress in sync across your devices"
            />

            <div className="rounded-xl border border-border p-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Cloud className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google Drive</p>
                      {authEmail && (
                        <p className="text-muted-foreground text-xs">{authEmail}</p>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-1.5">
                    <LogOut className="size-3.5" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Connect Google Drive to sync across devices
                  </p>
                  <AlertDialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="gap-1.5">
                        <Cloud className="size-3.5" />
                        Connect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogMedia>
                          <Cloud className="size-8" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Connect Google Drive</AlertDialogTitle>
                        <AlertDialogDescription>
                          Link your Google Drive to sync bookmarks, feeds, and reading
                          progress across devices. You'll be redirected to Google to
                          authorize access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowConnectDialog(false)}>
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          onClick={() => {
                            setShowConnectDialog(false);
                            handleSignIn();
                          }}
                          className="gap-1.5"
                        >
                          <Cloud className="size-3.5" />
                          Continue
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="mt-4">
                <Row
                  label="Sync status"
                  description={
                    lastSync
                      ? `Last synced ${new Date(lastSync).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                      : undefined
                  }
                  last
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-xs text-muted-foreground">
                      <StatusDot
                        status={
                          syncStatus === "connected" || syncStatus === "syncing" || syncStatus === "error"
                            ? syncStatus
                            : "idle"
                        }
                      />
                      {statusLabel}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncNow}
                      disabled={syncStatus === "syncing"}
                      className="gap-1.5"
                    >
                      <RefreshCw
                        className={cn("size-3.5", syncStatus === "syncing" && "animate-spin")}
                      />
                      Sync now
                    </Button>
                  </div>
                </Row>
              </div>
            )}
          </section>

          <Separator />

          {/* YouTube API key (reserved for future use) */}
          <section>
            <SectionHeading
              title="YouTube"
              description="Optional YouTube Data API key for handle resolution (future feature — works without one today)"
            />
            <div className="rounded-xl border border-border p-4">
              <input
                type="password"
                disabled
                placeholder="AIzaSy..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-2 text-muted-foreground text-xs">
                Not yet implemented. The app resolves YouTube handles automatically without an API key.
              </p>
            </div>
          </section>

          <Separator />

          {/* About */}
          <section>
            <SectionHeading title="About" description="App version and build information" />
            <div>
              <Row label="Version" last={false}>
                <span className="text-muted-foreground text-sm">1.0.0</span>
              </Row>
              <Row label="Build" last>
                <span className="text-muted-foreground text-sm">2024.04.12</span>
              </Row>
            </div>
          </section>
        </div>
      </div>

      {/* Error dialog */}
      <AlertDialog
        open={!!errorDialog}
        onOpenChange={(open) => {
          if (!open) setErrorDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertCircle className="size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>{errorDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setErrorDialog(null)}>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}