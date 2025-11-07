import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useReaderStore } from "@/lib/store";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { theme: systemTheme, setTheme } = useTheme();
  const setReaderTheme = useReaderStore((state) => state.setTheme);

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
        <h2 className="font-semibold text-xl text-foreground">Appearance</h2>
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
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mock Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="offline-mode" className="flex flex-col space-y-1">
            <span>Offline Mode</span>
            <span className="font-normal text-muted-foreground text-sm">
              Enable local-only storage and disable network requests.
            </span>
          </Label>
          <Switch id="offline-mode" defaultChecked />
        </div>
      </div>

      {/* Data Management Section (Placeholder) */}
      <div className="mt-8 space-y-6 rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold text-xl text-foreground">
          Data Management
        </h2>
        <Separator />
        <p className="text-muted-foreground text-sm">
          Data management options (Export, Import, Sync settings) will be
          available in Phase 2.
        </p>
      </div>
    </div>
  );
}
