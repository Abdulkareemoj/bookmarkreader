import type React from "react";
import { useState, useEffect } from "react";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Toolbar from "@/components/toolbar";
import { AppSidebar } from "@/components/app-sidebar";
import BottomNav from "@/components/bottom-nav";
import { ThemeProvider } from "@/integrations/theme-provider";

import { initializeWebAgents } from "@/lib/db";
import { initializeReaderStore, type ReaderState } from "@/lib/store";
import type { StoreApi } from "zustand";

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
        title: "TanStack Start Starter",
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

// Component to initialize the store asynchronously
function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Cast type to ensure TS correctly identifies the store API
  type InitializedStore = StoreApi<ReaderState>;

  useEffect(() => {
    async function setup() {
      try {
        const injectedAgents =
          typeof window !== "undefined"
            ? ((window as any).__BOOKMARKREADER_AGENTS__ as unknown)
            : undefined;

        if (injectedAgents) {
          setIsInitialized(true);
          return;
        }

        const agents = await initializeWebAgents();
        const store = initializeReaderStore(
          agents
        ) as unknown as InitializedStore;
        await store.getState().loadInitialData();
        setIsInitialized(true);
      } catch (e) {
        console.error("Failed to initialize application:", e);
        // Display error message
      }
    }
    setup();
  }, []);

  if (!isInitialized) {
    // Render loading state for web app
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading data...
      </div>
    );
  }

  return <>{children}</>;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
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
                <Toolbar />
                {children} <BottomNav />
              </SidebarInset>
            </SidebarProvider>
          </StoreProvider>
        </ThemeProvider>
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
