import "@/global.css";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";
import { appInit, getInitStatus } from "@/lib/mobile-init";
import { NAV_THEME } from "@/lib/theme";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

// Custom component to provide initialized store via context
function StoreProvider({ children }: { children: React.ReactNode }) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Simple initialization without complex patterns
	useEffect(() => {
		let mounted = true;

		async function init() {
			try {
				await appInit();
				if (mounted) setIsInitialized(true);
			} catch (e) {
				if (mounted) setError(e as Error);
			}
		}

		init();

		return () => {
			mounted = false;
		};
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
	const { theme } = useUniwind();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={NAV_THEME[(theme as "light" | "dark") ?? "light"]}>
				<StatusBar style={theme === "dark" ? "light" : "dark"} />
				<StoreProvider>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="search" options={{ headerShown: false }} />
					
					</Stack>
				</StoreProvider>
				<PortalHost />
				<PortalHost name="modal-host" />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
