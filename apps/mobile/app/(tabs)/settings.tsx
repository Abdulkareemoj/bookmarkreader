import { useState, useId } from "react";
import { ScrollView, Text, View, Alert } from "react-native";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useColorScheme } from "nativewind";
import { useReaderStore, useSettingsStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getInitializedAgents } from "@/lib/agents";

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
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
  const supabaseUrlId = useId();
  const supabaseKeyId = useId();

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
      Alert.alert("Success", "Synchronization complete!");
    } catch (e) {
      const error = e as Error;
      console.error("Sync error:", error);
      setSyncStatus("error");
      Alert.alert("Error", `Connection or Sync failed: ${error.message}`);
    }
  };

  const handleThemeChange = (value: string) => {
    setColorScheme(value as "light" | "dark" | "system");
    if (value !== "system") {
      setReaderTheme(value as "light" | "dark");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="mb-8 text-muted-foreground">
        Manage your application preferences and reading experience.
      </Text>

      {/* Appearance Section */}
      <View className="space-y-6 rounded-lg border border-border bg-card p-6">
        <Text className="font-semibold text-xl text-foreground">
          Appearance
        </Text>
        <View className="h-px bg-border" />

        {/* Theme Selector */}
        <View className="space-y-2">
          <Label className="text-base">Theme</Label>
          <RadioGroup
            value={colorScheme}
            onValueChange={handleThemeChange}
            className="flex flex-col space-y-1"
          >
            <View className="flex-row items-center space-x-2">
              <RadioGroupItem value="light" />
              <Label>Light</Label>
            </View>
            <View className="flex-row items-center space-x-2">
              <RadioGroupItem value="dark" />
              <Label>Dark</Label>
            </View>
            <View className="flex-row items-center space-x-2">
              <RadioGroupItem value="system" />
              <Label>System</Label>
            </View>
          </RadioGroup>
        </View>

        {/* Mock Toggle */}
        <View className="flex-row items-center justify-between">
          <Label className="flex-col space-y-1">
            <Text>Offline Mode</Text>
            <Text className="font-normal text-muted-foreground text-sm">
              Enable local-only storage and disable network requests.
            </Text>
          </Label>
          <Switch checked={true} onCheckedChange={() => {}} />
        </View>
      </View>

      {/* Sync Management Section */}
      <View className="mt-8 space-y-6 rounded-lg border border-border bg-card p-6 mb-10">
        <Text className="font-semibold text-xl text-foreground">
          Supabase Sync
        </Text>
        <View className="h-px bg-border" />
        <Text className="text-sm text-muted-foreground">
          Connect your application to a Supabase project for cross-device
          synchronization.
        </Text>

        {/* Supabase URL Input */}
        <View className="space-y-2">
          <Label htmlFor={supabaseUrlId}>Supabase URL</Label>
          <Input
            id={supabaseUrlId}
            keyboardType="url"
            placeholder="https://your-project.supabase.co"
            value={urlInput}
            onChangeText={setUrlInput}
          />
        </View>

        {/* Supabase Anon Key Input */}
        <View className="space-y-2">
          <Label htmlFor={supabaseKeyId}>Supabase Anon Key</Label>
          <Input
            id={supabaseKeyId}
            secureTextEntry
            placeholder="Paste your anon public key here"
            value={keyInput}
            onChangeText={setKeyInput}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">
            Status:{" "}
            <Text className="font-semibold text-primary">{syncStatus}</Text>
          </Text>
          <Button
            onPress={handleConnectOrSync}
            disabled={syncStatus === "connecting" || syncStatus === "syncing"}
          >
            <Text>
              {syncStatus === "connected" ? "Sync Now" : "Connect & Sync"}
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
