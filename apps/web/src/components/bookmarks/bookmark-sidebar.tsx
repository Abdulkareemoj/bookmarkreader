import type { Bookmark as BookmarkType } from "@packages/store";
import { Bookmark, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Define the expected structure for collections passed to the sidebar
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
}

export function BookmarkSidebar({
	collections = [], // Default to empty array to prevent reduce error
	selectedCollectionId,
	onSelectCollection,
	onRemoveCollection,
}: BookmarkSidebarProps) {
	// Safely calculate the total number of bookmarks
	const totalBookmarks = collections.reduce(
		(acc, collection) => acc + (collection.bookmarks?.length || 0), // Already safe here
		0,
	);

	return (
		<ScrollArea className="flex-1 px-4">
			<div className="flex flex-col gap-1">
				{/* All Bookmarks Link */}
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

				<Separator className="my-2" />

				{/* Individual Collections */}
				{collections.map((collection) => (
					<div
						key={collection.id}
						className="group flex items-center justify-between"
					>
						<Button
							variant={
								selectedCollectionId === collection.id ? "secondary" : "ghost"
							}
							className="w-full justify-start pr-2"
							onClick={() => onSelectCollection(collection.id)}
						>
							<span className="truncate">{collection.name}</span>
							{/* FIX: Use optional chaining to safely check length */}
							{collection.bookmarks?.length > 0 && (
								<Badge
									variant="secondary"
									className={cn(
										"ml-auto",
										selectedCollectionId === collection.id &&
											"bg-primary text-primary-foreground",
									)}
								>
									{/* FIX: Use optional chaining for display as well */}
									{collection.bookmarks?.length}
								</Badge>
							)}
						</Button>
						<ConfirmationDialog
							title="Remove Collection"
							description={`Are you sure you want to remove the collection: "${collection.name}"? This will also remove all its bookmarks.`}
							onConfirm={() => onRemoveCollection(collection.id)}
							trigger={
								<Button
									variant="ghost"
									size="icon"
									className="size-8 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
									title="Remove Collection"
								>
									<Trash2 data-icon="inline-start" />
								</Button>
							}
						/>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
