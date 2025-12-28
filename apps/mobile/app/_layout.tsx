import "@/global.css";

import { useState, useEffect } from "react";
import { initializeAgents } from "@packages/utils";
import { initializeReaderStore } from "@/lib/store";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { NAV_THEME } from "@/lib/theme";
import { Text, View } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Custom component to provide the initialized store via context
function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        // 1. Initialize platform-specific agents (DB connection, etc.)
        const agents = await initializeAgents();

        // 2. Initialize the global store instance with agents
        const store = initializeReaderStore(agents);

        // 3. Load initial data from the database
        await store.getState().loadInitialData();

        setIsInitialized(true);
      } catch (e) {
        console.error("Failed to initialize application:", e);
        setError(e as Error);
      }
    }
    setup();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-red-500">Error initializing application:</Text>
        <Text className="text-foreground">{error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    // Loading screen while the store and DB initialize
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Loading application data...</Text>
      </View>
    );
  }

  // Initialization is complete, render children
  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <StoreProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
        </Stack>
      </StoreProvider>
      <PortalHost />
    </ThemeProvider>
  );
}