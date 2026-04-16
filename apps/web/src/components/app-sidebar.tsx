import {
	Link,
	useMatchRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	GalleryVerticalEnd,
	HelpCircleIcon,
	Plus,
	Search,
	Settings,
} from "lucide-react";
import { useMemo, useState } from "react";
import AnimatedTabs from "@/components/animated-tabs";
import { BookmarkSidebar } from "@/components/bookmarks/bookmark-sidebar";
import { NavItems } from "@/components/navitems";
import { FeedSidebar } from "@/components/rss/feed-sidebar";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useFeeds } from "@/hooks/use-feeds";
import { useCollectionsStore } from "@/lib/collections-store";
import { useReaderStore } from "@/lib/store";

const navSecondary = [
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
	{
		title: "Get Help",
		url: "#",
		icon: HelpCircleIcon,
	},
];

export function AppSidebar() {
	const [newName, setNewName] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const matchRoute = useMatchRoute();
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	const {
		bookmarkCollections,
		addBookmarkCollection,
		removeBookmarkCollection,
	} = useCollectionsStore();
	const { feeds, removeFeed } = useFeeds();
	const { bookmarks } = useReaderStore((state) => state);

	// Get current collection/feed ID from search params
	const currentCollectionId = (location.search as any)?.filter || null;

	// Map collections with their bookmarks
	const collectionsWithBookmarks = useMemo(() => {
		return bookmarkCollections.map((collection) => ({
			id: collection.id,
			name: collection.name,
			bookmarks: bookmarks.filter(
				(bookmark) =>
					collection.id === "all" || bookmark.collectionId === collection.id,
			),
		}));
	}, [bookmarkCollections, bookmarks]);

	function setCollectionParam(collectionId: string | null) {
		const currentPath = location.pathname;
		const targetPath = currentPath.startsWith("/bookmarks")
			? "/bookmarks"
			: currentPath.startsWith("/rss")
				? "/rss"
				: "/";

		void navigate({
			to: targetPath as any,
			search: collectionId ? ({ filter: collectionId } as any) : undefined,
			replace: true,
		});
	}

	function handleSearch(query: string) {
		setSearchQuery(query);
		const currentPath = location.pathname;
		const targetPath = currentPath.startsWith("/bookmarks")
			? "/bookmarks"
			: currentPath.startsWith("/rss")
				? "/rss"
				: "/";

		void navigate({
			to: targetPath as any,
			search: query ? { q: query } : undefined,
			replace: true,
		});
	}

	function slugify(input: string): string {
		return input
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
	}

	const renderCollectionList = () => {
		if (matchRoute({ to: "/bookmarks", fuzzy: true })) {
			return (
				<BookmarkSidebar
					collections={collectionsWithBookmarks}
					selectedCollectionId={currentCollectionId}
					onSelectCollection={setCollectionParam}
					onRemoveCollection={removeBookmarkCollection}
				/>
			);
		}

		if (matchRoute({ to: "/rss", fuzzy: true })) {
			return (
				<FeedSidebar
					feeds={feeds}
					selectedFeedId={currentCollectionId}
					onSelectFeed={setCollectionParam}
					onRemoveFeed={removeFeed}
				/>
			);
		}

		if (matchRoute({ to: "/settings", fuzzy: true })) {
			return <SettingsSidebar />;
		}

		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<p className="text-sm">Select a tab to view collections.</p>
			</div>
		);
	};

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<GalleryVerticalEnd className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">WIP</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<div className="p-2">
					<AnimatedTabs />
				</div>
				<SidebarMenu>
					<SidebarGroup>
						<div className="flex items-center justify-between px-4">
							{showSearch ? (
								<div className="relative w-full">
									<Search className="absolute top-2.5 left-2.5 size-5 text-muted-foreground" />
									<Input
										autoFocus
										type="search"
										placeholder="Search..."
										className="w-full rounded-lg bg-background pl-8"
										value={searchQuery}
										onChange={(e) => handleSearch(e.target.value)}
										onBlur={() => setShowSearch(false)}
									/>
								</div>
							) : (
								<>
									<h2 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										{matchRoute({ to: "/", fuzzy: true }) && "Home"}
										{matchRoute({ to: "/bookmarks", fuzzy: true }) &&
											"Collections"}
										{matchRoute({ to: "/rss", fuzzy: true }) && "Sources"}
										{matchRoute({ to: "/explore", fuzzy: true }) && "Explore"}
										{matchRoute({ to: "/settings", fuzzy: true }) && "Settings"}
									</h2>
									<div className="flex items-center gap-2">
										{!matchRoute({ to: "/settings", fuzzy: true }) && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setShowSearch(true)}
												className="size-6 text-muted-foreground hover:text-foreground"
											>
												<Search className="size-5" />
											</Button>
										)}
										{matchRoute({ to: "/bookmarks", fuzzy: true }) && (
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="size-6 text-muted-foreground hover:text-foreground"
													>
														<Plus className="size-5" />
													</Button>
												</DialogTrigger>
												<DialogContent className="sm:max-w-106.25">
													<DialogHeader>
														<DialogTitle>New Collection</DialogTitle>
														<DialogDescription>
															Create a new bookmark collection to organize your
															saved links.
														</DialogDescription>
													</DialogHeader>
													<div className="py-2">
														<Input
															placeholder="Enter name..."
															value={newName}
															onChange={(e) => setNewName(e.target.value)}
														/>
													</div>
													<DialogFooter>
														<DialogClose asChild>
															<Button type="button" variant="outline">
																Cancel
															</Button>
														</DialogClose>
														<DialogClose asChild>
															<Button
																onClick={() => {
																	const name = newName.trim();
																	if (!name) return;
																	addBookmarkCollection(name);
																	setNewName("");
																	setCollectionParam(slugify(name));
																}}
															>
																Add
															</Button>
														</DialogClose>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										)}
									</div>
								</>
							)}
						</div>
					</SidebarGroup>
					{/* Render the appropriate content based on the active tab */}
					<SidebarMenuItem className="p-0">
						{renderCollectionList()}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<NavItems items={navSecondary} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
