import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rss, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddFeedDialog } from "@/components/rss/add-feed-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import type { Feed } from "@packages/store";

interface FeedSidebarProps {
  feeds: Feed[];
  selectedFeedId: string | null;
  onSelectFeed: (id: string | null) => void;
  onRemoveFeed: (id: string) => void;
}

export function FeedSidebar({
  feeds,
  selectedFeedId,
  onSelectFeed,
  onRemoveFeed,
}: FeedSidebarProps) {
  const totalUnread = feeds.reduce((sum, f) => sum + f.unreadCount, 0);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-4">
        {/* Add Feed Dialog */}
        <AddFeedDialog />
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1">
          {/* All Articles Link */}
          <Button
            variant={selectedFeedId === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectFeed(null)}
          >
            <Rss className="mr-2 h-4 w-4" />
            All Articles
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto",
                selectedFeedId === null && "bg-primary text-primary-foreground"
              )}
            >
              {totalUnread}
            </Badge>
          </Button>

          <Separator className="my-2" />

          {/* Individual Feeds */}
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-center justify-between group"
            >
              <Button
                variant={selectedFeedId === feed.id ? "secondary" : "ghost"}
                className="w-full justify-start pr-2"
                onClick={() => onSelectFeed(feed.id)}
              >
                <span className="truncate">{feed.title}</span>
                {feed.unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-auto",
                      selectedFeedId === feed.id &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    {feed.unreadCount}
                  </Badge>
                )}
              </Button>
              <ConfirmationDialog
                title="Remove Feed"
                description={`Are you sure you want to remove the feed: "${feed.title}"? This will also remove all its articles.`}
                onConfirm={() => onRemoveFeed(feed.id)}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 text-destructive"
                    title="Remove Feed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
