"use client";

import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Compass, Rss } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "Bookmarks",
    value: "/bookmarks",
    icon: Bookmark,
  },
  {
    name: "RSS",
    value: "/rss",
    icon: Rss,
  },
  {
    name: "Explore",
    value: "/explore",
    icon: Compass,
  },
];

export default function AnimatedTabs() {
  const matchRoute = useMatchRoute();
  const router = useRouterState();

  return (
    <div className="w-full">
      <Tabs value={router.location.pathname} className="gap-4">
        <TabsList className="h-auto w-full gap-2 rounded-lg bg-sidebar-accent p-1">
          {tabs.map(({ icon: Icon, name, value }) => {
            const isActive = matchRoute({ to: value, fuzzy: true });

            return (
              <Link to={value} key={value} className="flex-1">
                <motion.div
                  layout
                  className={cn(
                    "flex h-8 items-center justify-center overflow-hidden rounded-md"
                  )}
                  initial={false}
                  animate={{
                    width: isActive ? "100%" : "auto",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <TabsTrigger value={value} asChild>
                    <motion.div
                      className="flex h-8 w-full items-center justify-center gap-2 px-3"
                      animate={{ filter: "blur(0px)" }}
                      exit={{ filter: "blur(2px)" }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            className="whitespace-nowrap font-medium text-sm"
                            initial={{ opacity: 0, scaleX: 0.8 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0.8 }}
                            transition={{
                              duration: 0.25,
                              ease: "easeOut",
                            }}
                            style={{ originX: 0 }}
                          >
                            {name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </TabsTrigger>
                </motion.div>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
