import type * as React from "react";
import {
  useMatchRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import AnimatedTabs from "@/components/animated-tabs";
import { useCollectionsStore } from "@/lib/collections-store";
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
  SidebarRail,
} from "@/components/ui/sidebar";
// import { NavUser } from "./nav-user";
import { Plus, Rss } from "lucide-react";
import { useState } from "react";

// This is sample data.
// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
// };

export function AppSidebar() {
  const [newName, setNewName] = useState("");
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });

  const {
    bookmarkCollections,
    rssCollections,
    addBookmarkCollection,
    addRssCollection,
  } = useCollectionsStore();

  function setCollectionParam(collectionId: string) {
    void navigate({
      to: (location.pathname as any) || "/",
      search: (prev: any) => ({
        ...prev,
        collection: collectionId === "all" ? undefined : collectionId,
      }),
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
    if (matchRoute({ to: "/" })) {
      return (
        <div className="space-y-1">
          {bookmarkCollections.map((collection) => (
            <Button
              key={collection.id}
              variant="ghost"
              className="group flex w-full items-center justify-between rounded-md px-4 py-2 text-sm"
              onClick={() => setCollectionParam(collection.id)}
            >
              <span className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                {collection.name}
              </span>
            </Button>
          ))}
        </div>
      );
    }

    if (matchRoute({ to: "/rss" })) {
      return (
        <div className="space-y-1">
          {rssCollections.map((source) => (
            <Button
              key={source.id}
              variant="ghost"
              className="group flex w-full items-center justify-between rounded-md px-4 py-2 text-sm"
              onClick={() => setCollectionParam(source.id)}
            >
              <span className="flex items-center gap-2">
                <Rss className="h-3 w-3 text-blue-500" />
                {source.name}
              </span>
            </Button>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">Coming soon...</p>
      </div>
    );
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {" "}
        <SidebarGroup>
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {matchRoute({ to: "/" }) && "Collections"}
                {matchRoute({ to: "/rss" }) && "Sources"}
                {matchRoute({ to: "/explore" }) && "Explore"}
              </h2>
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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>New Collection</DialogTitle>
                    <DialogDescription>
                      Create a new bookmark collection to organize your saved
                      links.
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
                    <Button
                      onClick={() => {
                        const name = newName.trim();
                        if (!name) return;
                        if (matchRoute({ to: "/" })) {
                          addBookmarkCollection(name);
                        } else if (matchRoute({ to: "/rss" })) {
                          addRssCollection(name);
                        }
                        setNewName("");
                        setCollectionParam(slugify(name));
                      }}
                    >
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {renderCollectionList()}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AnimatedTabs />
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
