import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import BottomNav from "@/components/bottom-nav";
import { StoreProvider } from "@/components/store-provider";
import Toolbar from "@/components/toolbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/integrations/theme-provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Bookmark Reader",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<StoreProvider>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<TooltipProvider>
							<Toolbar />
							{children}
							<BottomNav />
						</TooltipProvider>
					</SidebarInset>
				</SidebarProvider>
			</StoreProvider>
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const isDesktop =
		typeof window !== "undefined" &&
		(window as unknown as { __BOOKMARKREADER_AGENTS__?: unknown })
			.__BOOKMARKREADER_AGENTS__;

	if (isDesktop) {
		return (
			<>
				<AppLayout>{children}</AppLayout>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
			</>
		);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<AppLayout>{children}</AppLayout>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
