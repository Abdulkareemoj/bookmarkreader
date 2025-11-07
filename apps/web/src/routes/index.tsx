import { createFileRoute } from "@tanstack/react-router";
import { DashboardCard } from "@/components/dashboard-card";
import { Bookmark, Rss, Compass, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: DashboardComponent,
});

// Mock data for dashboard summary
const dashboardData = [
  {
    title: "Total Bookmarks",
    value: 42,
    icon: Bookmark,
    to: "/bookmarks",
    colorClass: "text-blue-500",
  },
  {
    title: "Unread Articles",
    value: 15,
    icon: Rss,
    to: "/rss",
    colorClass: "text-orange-500",
  },
  {
    title: "Liked Items",
    value: 8,
    icon: Heart,
    to: "/bookmarks", // Assuming liked items are part of bookmarks for now
    colorClass: "text-red-500",
  },
  {
    title: "New in Explore",
    value: 5,
    icon: Compass,
    to: "/explore",
    colorClass: "text-green-500",
  },
];

function DashboardComponent() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 font-bold text-3xl text-foreground">Dashboard</h1>
      <p className="mb-8 text-muted-foreground">
        A quick overview of your saved content and feeds.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardData.map((item) => (
          <DashboardCard key={item.title} {...item} />
        ))}
      </div>

      {/* Placeholder for recent activity or quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 font-semibold text-2xl text-foreground">
          Recent Activity
        </h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            No recent activity yet. Start saving bookmarks or subscribing to
            feeds!
          </p>
        </div>
      </div>
    </div>
  );
}
