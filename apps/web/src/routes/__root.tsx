import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "../index.css";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Toolbar from "@/components/toolbar";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "bookmark-tool",
			},
			{
				name: "description",
				content: "bookmark-tool is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	// const isFetching = useRouterState({
	// 	select: (s) => s.isLoading,
	// });

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="flex h-screen bg-background">
					<Sidebar
						isOpen={sidebarOpen}
						onToggle={() => setSidebarOpen(!sidebarOpen)}
					/>
					<div className="flex flex-1 flex-col overflow-hidden">
						<Toolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
						<Outlet />
					</div>
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
