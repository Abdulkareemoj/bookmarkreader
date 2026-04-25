import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Compass, Heart, Rss } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);

	// Calculate real stats
	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const likedItems = bookmarks.filter((b) => b.liked).length + articles.filter((a) => a.liked).length;
	const totalFeeds = feeds.length;

	const dashboardData = [
		{
			title: "Total Bookmarks",
			value: totalBookmarks,
			icon: Bookmark,
			to: "/bookmarks",
			colorClass: "text-blue-500",
		},
		{
			title: "Unread Articles",
			value: unreadArticles,
			icon: Rss,
			to: "/rss",
			colorClass: "text-orange-500",
		},
		{
			title: "Liked Items",
			value: likedItems,
			icon: Heart,
			to: "/bookmarks",
			colorClass: "text-red-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Compass,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

	return (
		<div className="p-4 md:p-8">
			<h1 className="mb-6 font-bold text-3xl text-foreground">Dashboard</h1>
			<p className="mb-8 text-muted-foreground">
				A quick overview of your saved content and feeds.
			</p>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{dashboardData.map((item: any) => (
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
						{totalBookmarks === 0 && totalFeeds === 0
							? "No recent activity yet. Start saving bookmarks or subscribing to feeds!"
							: `You have ${totalBookmarks} bookmarks and ${unreadArticles} unread articles across ${totalFeeds} feeds.`}
					</p>
				</div>
			</div>
		</div>
	);
}
