
import { ColumnDef } from "@tanstack/react-table";
import { Bookmark as BookmarkType } from "@packages/store";
import {
  ArrowUpDown,
  Bookmark,
  Heart,
  Link as LinkIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

interface BookmarkActions {
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}

export const createBookmarkColumns = ({
  onLike,
  onSave,
  onDelete,
}: BookmarkActions): ColumnDef<BookmarkType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bookmark = row.original;
      return (
        <Link
          to="/bookmarks/$id"
          params={{ id: bookmark.id }}
          className="flex flex-col space-y-1"
        >
          <span className="font-medium text-foreground hover:text-primary transition-colors truncate">
            {bookmark.title}
          </span>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <LinkIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{bookmark.url}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags: string[] = row.getValue("tags");
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "liked",
    header: "Liked",
    cell: ({ row }) => {
      const liked: boolean = row.getValue("liked");
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", liked && "text-red-500")}
          onClick={() => onLike(row.original.id)}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
        </Button>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "saved",
    header: "Saved",
    cell: ({ row }) => {
      const saved: boolean = row.getValue("saved");
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", saved && "text-blue-500")}
          onClick={() => onSave(row.original.id)}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-blue-500")} />
        </Button>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bookmark = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              Open Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmationDialog
              title="Confirm Deletion"
              description={`Are you sure you want to delete the bookmark: "${bookmark.title}"? This action cannot be undone.`}
              onConfirm={() => onDelete(bookmark.id)}
              trigger={
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()} // Prevent closing dropdown on trigger click
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
