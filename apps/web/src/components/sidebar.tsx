import { useMatchRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Menu, Plus, Rss, X } from "lucide-react";
import { useState } from "react";
import AnimatedTabs from "@/components/animated-tabs";
import { cn } from "@/lib/utils";

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
	const [expandedCollections, setExpandedCollections] = useState<string[]>([
		"bookmarks",
	]);
	const matchRoute = useMatchRoute();

	// Collections for Bookmarks tab
	const bookmarkCollections = [
		{ id: "all", label: "All Bookmarks", count: 24 },
		{ id: "tech", label: "Technology", count: 8 },
		{ id: "business", label: "Business", count: 5 },
		{ id: "science", label: "Science", count: 11 },
	];

	// Sources for RSS tab
	const rssSources = [
		{ id: "hn", label: "Hacker News", count: 3 },
		{ id: "techcrunch", label: "TechCrunch", count: 5 },
		{ id: "medium", label: "Medium", count: 12 },
		{ id: "arxiv", label: "arXiv", count: 7 },
	];

	const toggleCollection = (id: string) => {
		setExpandedCollections((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const renderCollectionList = () => {
		if (matchRoute({ to: "/" })) {
			return (
				<div className="space-y-1">
					{bookmarkCollections.map((collection) => (
						<Button
							key={collection.id}
							className="group flex w-full items-center justify-between rounded-md px-4 py-2 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent"
						>
							<span className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-sidebar-primary" />
								{collection.label}
							</span>
							<span className="text-sidebar-foreground/50 text-xs group-hover:text-sidebar-foreground/70">
								{collection.count}
							</span>
						</Button>
					))}
				</div>
			);
		}

		if (matchRoute({ to: "/rss" })) {
			return (
				<div className="space-y-1">
					{rssSources.map((source) => (
						<Button
							key={source.id}
							className="group flex w-full items-center justify-between rounded-md px-4 py-2 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent"
						>
							<span className="flex items-center gap-2">
								<Rss className="h-3 w-3 text-sidebar-primary" />
								{source.label}
							</span>
							<span className="text-sidebar-foreground/50 text-xs group-hover:text-sidebar-foreground/70">
								{source.count}
							</span>
						</Button>
					))}
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center py-8 text-sidebar-foreground/50">
				<p className="text-sm">Coming soon...</p>
			</div>
		);
	};

	return (
		<>
			{/* Mobile Toggle Button */}
			<div className="fixed top-4 left-4 z-50 hidden md:hidden">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggle}
					className="text-foreground"
				>
					{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
				</Button>
			</div>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed z-40 flex h-screen w-64 flex-col border-sidebar-border border-r bg-sidebar transition-transform duration-300 ease-in-out md:relative",
					!isOpen && "-translate-x-full md:translate-x-0",
				)}
			>
				{/* Header */}
				<div className="my-1 border-sidebar-border border-b p-4">
					<h1 className="font-bold text-sidebar-foreground text-xl">Crate</h1>
				</div>

				{/* Collections/Sources Section - Dynamic based on tab */}
				<div className="flex-1 overflow-y-auto px-4 py-4">
					<div className="mb-4">
						<div className="mb-3 flex items-center justify-between">
							<h2 className="font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wider">
								{matchRoute({ to: "/" }) && "Collections"}
								{matchRoute({ to: "/rss" }) && "Sources"}
								{matchRoute({ to: "/explore" }) && "Explore"}
							</h2>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 text-sidebar-foreground/50 hover:text-sidebar-foreground"
							>
								<Plus className="h-3 w-3" />
							</Button>
						</div>
						{renderCollectionList()}
					</div>
				</div>

				<div className="border-sidebar-border border-t p-4">
					<AnimatedTabs />
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 md:hidden"
					onClick={onToggle}
				/>
			)}
		</>
	);
}
