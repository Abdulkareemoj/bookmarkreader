import type { Bookmark as BookmarkType } from "@packages/store";
import {
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	Archive,
	Bookmark,
	Heart,
	Plus,
	Search,
	Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CollectionWithBookmarks {
	id: string;
	name: string;
	bookmarks: BookmarkType[];
}

interface BookmarkSidebarProps {
	collections: CollectionWithBookmarks[];
	selectedCollectionId: string | null;
	onSelectCollection: (id: string | null) => void;
	onRemoveCollection: (id: string) => void;
	onAddCollection: (name: string) => void;
}

const navItems = [
	{ icon: Heart, label: "Favorites", href: "/bookmarks/favorites" },
	{ icon: Archive, label: "Archive", href: "/bookmarks/archive" },
];

export function BookmarkSidebar({
	collections = [],
	selectedCollectionId,
	onSelectCollection,
	onRemoveCollection,
	onAddCollection,
}: BookmarkSidebarProps) {
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState("");

	// Read current tags from URL
	const tagsParam = ((location.search as any)?.tags as string) || "";
	const selectedTags = useMemo(() => {
		if (!tagsParam) return [];
		return tagsParam.split(",").filter(Boolean);
	}, [tagsParam]);

	// Extract unique tags from all bookmarks with counts
	const allTags = useMemo(() => {
		const tagMap = new Map<string, number>();
		collections.forEach((c) => {
			c.bookmarks.forEach((b) => {
				if (b.tags && Array.isArray(b.tags)) {
					b.tags.forEach((t) => {
						tagMap.set(t, (tagMap.get(t) || 0) + 1);
					});
				}
			});
		});
		return Array.from(tagMap.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([name, count]) => ({ name, count }));
	}, [collections]);

	const totalBookmarks = collections.reduce(
		(acc, c) => acc + (c.bookmarks?.length || 0),
		0,
	);

	const toggleTag = (tag: string) => {
		const current = new Set(selectedTags);
		if (current.has(tag)) {
			current.delete(tag);
		} else {
			current.add(tag);
		}
		const next = Array.from(current);
		void navigate({
			search: (prev: any) => ({
				...prev,
				tags: next.length > 0 ? next.join(",") : undefined,
			}),
			replace: true,
		});
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		void navigate({
			search: (prev: any) => ({
				...prev,
				q: query || undefined,
			}),
			replace: true,
		});
	};

	return (
		<ScrollArea className="flex-1 px-4">
			<div className="flex flex-col gap-4 py-2">
				{/* Search */}
				{showSearch ? (
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
						<Input
							autoFocus
							placeholder="Search bookmarks..."
							className="h-9 pl-8"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							onBlur={() => {
								if (!searchQuery) setShowSearch(false);
							}}
						/>
					</div>
				) : (
					<Button
						variant="ghost"
						className="w-full justify-start text-muted-foreground"
						onClick={() => setShowSearch(true)}
					>
						<Search className="mr-2 size-4" />
						Search bookmarks...
					</Button>
				)}

				{/* All Bookmarks */}
				<Button
					variant={selectedCollectionId === null ? "secondary" : "ghost"}
					className="w-full justify-start"
					onClick={() => onSelectCollection(null)}
				>
					<Bookmark data-icon="inline-start" />
					All Bookmarks
					<Badge
						variant="secondary"
						className={cn(
							"ml-auto",
							selectedCollectionId === null &&
								"bg-primary text-primary-foreground",
						)}
					>
						{totalBookmarks}
					</Badge>
				</Button>

				{/* Collections */}
				{collections.length > 1 && (
					<>
						<Separator />
						<div className="flex flex-col gap-1">
							<h3 className="px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
								Collections
							</h3>
							{/* New Collection */}
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="w-full justify-start"
						>
							<Plus className="mr-2 size-4" />
							New Collection
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-106.25">
						<DialogHeader>
							<DialogTitle>New Collection</DialogTitle>
							<DialogDescription>
								Create a new bookmark collection to organize your saved links.
							</DialogDescription>
						</DialogHeader>
						<div className="py-2">
							<Input
								placeholder="Enter name..."
								value={newCollectionName}
								onChange={(e) => setNewCollectionName(e.target.value)}
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
										onAddCollection(newCollectionName);
										setNewCollectionName("");
									}}
								>
									Add
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
							{collections
								.filter((c) => c.id !== "all")
								.map((collection) => (
									<div
										key={collection.id}
										className="group flex items-center justify-between"
									>
										<Button
											variant={
												selectedCollectionId === collection.id
													? "secondary"
													: "ghost"
											}
											className="w-full justify-start pr-2"
											onClick={() => onSelectCollection(collection.id)}
										>
											<span className="truncate">{collection.name}</span>
											{collection.bookmarks?.length > 0 && (
												<Badge
													variant="secondary"
													className={cn(
														"ml-auto",
														selectedCollectionId === collection.id &&
															"bg-primary text-primary-foreground",
													)}
												>
													{collection.bookmarks?.length}
												</Badge>
											)}
										</Button>
									</div>
								))}
						</div>
					</>
				)}

				{/* Tags */}
				{allTags.length > 0 && (
					<>
						<Separator />
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between px-2">
								<h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
									Tags
								</h3>
								{selectedTags.length > 0 && (
									<button
										onClick={() => {
											void navigate({
												search: (prev: any) => ({
													...prev,
													tags: undefined,
												}),
												replace: true,
											});
										}}
										className="text-[10px] text-muted-foreground hover:text-foreground"
									>
										Clear
									</button>
								)}
							</div>
							<div className="flex flex-wrap gap-1.5 px-1">
								{allTags.map(({ name, count }) => {
									const isActive = selectedTags.includes(name);
									return (
										<button
											key={name}
											onClick={() => toggleTag(name)}
											className={cn(
												"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
												isActive
													? "bg-primary text-primary-foreground"
													: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<Tag className="size-3" />
											{name}
											<span className="opacity-60">({count})</span>
										</button>
									);
								})}
							</div>
						</div>
					</>
				)}

				{/* Navigation */}
				<>
					<Separator />
					<div className="flex flex-col gap-1">
						{navItems.map((item) => {
							const isActive = location.pathname === item.href.split("?")[0];
							return (
								<Button
									key={item.label}
									variant={isActive ? "secondary" : "ghost"}
									className="w-full justify-start"
									onClick={() => void navigate({ to: item.href as any })}
								>
									<item.icon className="mr-2 size-4" />
									{item.label}
								</Button>
							);
						})}
					</div>
				</>

				
			</div>
		</ScrollArea>
	);
}