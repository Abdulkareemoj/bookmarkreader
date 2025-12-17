import { createFileRoute } from "@tanstack/react-router";
import { useState, useId } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useReaderStore, useSettingsStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { getInitializedAgents } from "@/lib/agents";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const themeLightId = useId();
  const themeDarkId = useId();
  const themeSystemId = useId();
  const offlineModeId = useId();
  const supabaseUrlId = useId();
  const supabaseKeyId = useId();

  const { theme: systemTheme, setTheme } = useTheme();
  const setReaderTheme = useReaderStore((state) => state.setTheme);

  const {
    supabaseUrl,
    supabaseAnonKey,
    syncStatus,
    setSupabaseConfig,
    setSyncStatus,
  } = useSettingsStore();

  const [urlInput, setUrlInput] = useState(supabaseUrl);
  const [keyInput, setKeyInput] = useState(supabaseAnonKey);

  // NOTE: This assumes a way to access the SyncAgent, which is currently initialized globally
  // I will assume we can access the agents via a hypothetical context or a direct global access for now,
  // but since we don't have a context in the web app yet, I will use a placeholder or assume global access.
  // For now, I will define a hypothetical function that will be implemented in step 8.
  const handleConnectOrSync = async () => {
    if (!urlInput || !keyInput) return;

    setSupabaseConfig(urlInput, keyInput);

    setSyncStatus("connecting");
    try {
      const agents = getInitializedAgents();
      const syncAgent = agents.syncAgent;

      // NOTE: We rely on the remoteApi module (in @packages/api) to use
      // the globally set config (which we set via setSupabaseConfig and is persisted/accessible).

      await syncAgent.testConnection();

      setSyncStatus("syncing");
      await syncAgent.syncAllData();

      setSyncStatus("connected");
      alert("Synchronization complete!");
    } catch (e) {
      const error = e as Error;
      console.error("Sync error:", error);
      setSyncStatus("error");
      alert(`Connection or Sync failed: ${error.message}`);
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    if (value !== "system") {
      setReaderTheme(value as "light" | "dark");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 font-bold text-3xl text-foreground">Settings</h1>
      <p className="mb-8 text-muted-foreground">
        Manage your application preferences and reading experience.
      </p>

      {/* Appearance Section */}
      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground text-xl">Appearance</h2>
        <Separator />

        {/* Theme Selector */}
        <div className="space-y-2">
          <Label className="text-base">Theme</Label>
          <RadioGroup
            defaultValue={systemTheme}
            value={systemTheme}
            onValueChange={handleThemeChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id={themeLightId} />
              <Label htmlFor={themeLightId}>Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id={themeDarkId} />
              <Label htmlFor={themeDarkId}>Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id={themeSystemId} />
              <Label htmlFor={themeSystemId}>System</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mock Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={offlineModeId} className="flex flex-col space-y-1">
            <span>Offline Mode</span>
            <span className="font-normal text-muted-foreground text-sm">
              Enable local-only storage and disable network requests.
            </span>
          </Label>
          <Switch id={offlineModeId} defaultChecked />
        </div>
      </div>

      {/* Sync Management Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Supabase Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Connect your application to a Supabase project for cross-device
            synchronization.
          </p>

          <div className="space-y-2">
            <Label htmlFor={supabaseUrlId}>Supabase URL</Label>
            <Input
              id={supabaseUrlId}
              type="url"
              placeholder="https://your-project.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={supabaseKeyId}>Supabase Anon Key</Label>
            <Input
              id={supabaseKeyId}
              type="password"
              placeholder="Paste your anon public key here"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-semibold text-primary">{syncStatus}</span>
            </span>
            <Button
              onClick={handleConnectOrSync}
              disabled={syncStatus === "connecting" || syncStatus === "syncing"}
            >
              {syncStatus === "connected" ? "Sync Now" : "Connect & Sync"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
