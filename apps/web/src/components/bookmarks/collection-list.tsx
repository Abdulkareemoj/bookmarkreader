import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GalleryVerticalEnd, Rss, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionItem {
  id: string;
  name: string;
}

interface CollectionListProps {
  collections: CollectionItem[];
  type: "bookmark" | "rss";
}

export function CollectionList({ collections, type }: CollectionListProps) {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const currentCollectionId = (location.search as any)?.collection || "all";

  function setCollectionParam(collectionId: string) {
    const basePath = type === "bookmark" ? "/bookmarks" : "/rss";
    void navigate({
      to: basePath as any,
      search: (prev: any) => ({
        ...prev,
        collection: collectionId === "all" ? undefined : collectionId,
      }),
      replace: true,
    });
  }

  const allCollection = collections.find((c) => c.id === "all");
  const customCollections = collections.filter((c) => c.id !== "all");
  const Icon = type === "bookmark" ? GalleryVerticalEnd : Rss;
  const title = type === "bookmark" ? "Custom Collections" : "Feeds";

  return (
    <div className="space-y-1">
      {/* Always show 'All' item outside the collapsible */}
      {allCollection && (
        <Button
          key={allCollection.id}
          variant="ghost"
          className={cn(
            "group flex w-full items-center justify-start rounded-md px-4 py-2 text-sm",
            currentCollectionId === allCollection.id &&
              "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
          onClick={() => setCollectionParam(allCollection.id)}
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {allCollection.name}
          </span>
        </Button>
      )}

      {/* Custom Collections/Feeds (Collapsible) */}
      {customCollections.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <span className="flex items-center gap-2">{title}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="space-y-1 pl-4">
              {customCollections.map((collection) => (
                <Button
                  key={collection.id}
                  variant="ghost"
                  className={cn(
                    "group flex w-full items-center justify-start rounded-md px-4 py-2 text-sm",
                    currentCollectionId === collection.id &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => setCollectionParam(collection.id)}
                >
                  <span className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    {collection.name}
                  </span>
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
