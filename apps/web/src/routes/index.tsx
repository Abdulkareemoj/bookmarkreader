import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Welcome to your dashboard. Here is a summary of your content.</p>
      <div className="mt-4 flex gap-4">
        <Link to="/bookmarks" className="text-blue-500 hover:underline">Go to Bookmarks</Link>
        <Link to="/rss" className="text-blue-500 hover:underline">Go to RSS Feeds</Link>
        <Link to="/explore" className="text-blue-500 hover:underline">Go to Explore</Link>
      </div>
    </div>
  );
}
