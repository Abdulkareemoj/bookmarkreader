import { ScrollView, Text, View } from "react-native";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useColorScheme } from "nativewind";
import { useReaderStore } from "@/lib/store";

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const setReaderTheme = useReaderStore((state) => state.setTheme);

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
            defaultValue={colorScheme}
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
          <Switch defaultChecked />
        </View>
      </View>

      {/* Data Management Section (Placeholder) */}
      <View className="mt-8 space-y-6 rounded-lg border border-border bg-card p-6 mb-10">
        <Text className="font-semibold text-xl text-foreground">
          Data Management
        </Text>
        <View className="h-px bg-border" />
        <Text className="text-muted-foreground text-sm">
          Data management options (Export, Import, Sync settings) will be
          available in Phase 2.
        </Text>
      </View>
    </ScrollView>
  );
}
