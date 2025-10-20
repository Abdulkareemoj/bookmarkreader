import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReaderContent from "@/components/reader-content";
import Sidebar from "@/components/sidebar";
import Toolbar from "@/components/toolbar";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [activeTab, setActiveTab] = useState("bookmarks");

	return (
		<div className="flex h-screen bg-background">
			<Sidebar
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			{/* Main Content Area */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Toolbar */}
				<Toolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

				{/* Reader Content - Pass activeTab for context-aware rendering */}
				<ReaderContent activeTab={activeTab} />
			</div>
		</div>
	);
}
