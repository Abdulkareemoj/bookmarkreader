import { useCollectionsStore } from "@packages/store";
import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Compass, Plus, Rss } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import ArticleCard from "@/components/rss/article-card";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const bookmarks = useReaderStore((state) => state.bookmarks);
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const bookmarkCollections = useCollectionsStore(
		(state) => state.bookmarkCollections,
	);

	// Calculate real stats
	const totalBookmarks = bookmarks.length;
	const unreadArticles = articles.filter((a) => !a.read).length;
	const totalFeeds = feeds.length;

	// Calculate total reading time for unread articles
	const totalReadingTime = articles
		.filter((a) => !a.read)
		.reduce((acc, a) => acc + (a.readTime || 0), 0);

	// Time-based sections
	const today = new Date();
	const todayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	).toISOString();
	const weekAgo = new Date(
		today.getTime() - 7 * 24 * 60 * 60 * 1000,
	).toISOString();

	const bookmarksToday = bookmarks.filter((b) => b.createdAt >= todayStart);
	const articlesToday = articles.filter((a) => a.pubDate >= todayStart);
	const bookmarksThisWeek = bookmarks.filter((b) => b.createdAt >= weekAgo);
	const articlesThisWeek = articles.filter((a) => a.pubDate >= weekAgo);

	// Daily highlights - top articles by likes or recent
	const dailyHighlights = articles
		.filter((a) => !a.read)
		.sort((a, b) => {
			// Prioritize liked articles
			if (a.liked && !b.liked) return -1;
			if (!a.liked && b.liked) return 1;
			// Then by publication date
			return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
		})
		.slice(0, 5);

	// Trending articles - most liked/saved articles from the last week
	const trendingArticles = articles
		.filter((a) => a.pubDate >= weekAgo)
		.sort(
			(a, b) =>
				(b.liked ? 1 : 0) -
				(a.liked ? 1 : 0) +
				(b.saved ? 1 : 0) -
				(a.saved ? 1 : 0),
		)
		.slice(0, 5);

	// Reading streak - calculate consecutive days with reading activity
	const readArticlesByDate = new Map<string, number>();
	articles
		.filter((a) => a.read && a.readAt)
		.forEach((a) => {
			const date = a.readAt?.split("T")[0] || "";
			readArticlesByDate.set(date, (readArticlesByDate.get(date) || 0) + 1);
		});

	let currentStreak = 0;
	for (let i = 0; i < 30; i++) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split("T")[0];
		if (readArticlesByDate.has(dateStr)) {
			currentStreak++;
		} else if (i > 0) {
			break;
		}
	}

	// Reading stats
	const totalRead = articles.filter((a) => a.read).length;
	const totalLiked = articles.filter((a) => a.liked).length;
	const totalSaved = articles.filter((a) => a.saved).length;

	// Pinned items - bookmarks and articles marked as pinned
	const pinnedBookmarks = bookmarks.filter((b) => b.pinned);
	const pinnedArticles = articles.filter((a) => a.pinned);

	// Feed-specific sections - group articles by feed
	const articlesByFeed = feeds.slice(0, 3).map((feed) => ({
		feed,
		articles: articles
			.filter((a) => a.feedId === feed.id && !a.read)
			.slice(0, 3),
	}));

	// Tag cloud - extract tags from bookmarks
	const allTags = bookmarks.flatMap((b) => b.tags || []);
	const tagCounts = allTags.reduce(
		(acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topTags = Object.entries(tagCounts)
		.filter(([_, count]) => typeof count === "number")
		.map(([tag, count]) => [tag, count as number])
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

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
			title: "Reading Time",
			value: totalReadingTime,
			icon: Compass,
			to: "/rss",
			colorClass: "text-purple-500",
		},
		{
			title: "RSS Feeds",
			value: totalFeeds,
			icon: Rss,
			to: "/rss",
			colorClass: "text-green-500",
		},
	];

	return (
		<div className="p-4 md:p-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-foreground">Dashboard</h1>
					<p className="text-muted-foreground">
						A quick overview of your saved content and feeds.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Plus data-icon="inline-start" className="mr-2" />
						Add Bookmark
					</Button>
					<Button size="sm">
						<Plus data-icon="inline-start" className="mr-2" />
						Add Feed
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{dashboardData.map((item: any) => (
					<DashboardCard key={item.title} {...item} />
				))}
			</div>

			{/* Time-based sections */}
			<div className="mt-10 flex flex-col gap-6">
				{(bookmarksToday.length > 0 || articlesToday.length > 0) && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Today's Activity
						</h2>
						<p className="text-muted-foreground">
							{bookmarksToday.length > 0 &&
								`${bookmarksToday.length} bookmark${bookmarksToday.length !== 1 ? "s" : ""} added`}
							{bookmarksToday.length > 0 && articlesToday.length > 0 && " • "}
							{articlesToday.length > 0 &&
								`${articlesToday.length} article${articlesToday.length !== 1 ? "s" : ""} published`}
						</p>
					</div>
				)}

				{(bookmarksThisWeek.length > 0 || articlesThisWeek.length > 0) && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							This Week
						</h2>
						<p className="text-muted-foreground">
							{bookmarksThisWeek.length > 0 &&
								`${bookmarksThisWeek.length} bookmark${bookmarksThisWeek.length !== 1 ? "s" : ""}`}
							{bookmarksThisWeek.length > 0 &&
								articlesThisWeek.length > 0 &&
								" • "}
							{articlesThisWeek.length > 0 &&
								`${articlesThisWeek.length} article${articlesThisWeek.length !== 1 ? "s" : ""}`}
						</p>
					</div>
				)}

				{/* Collections Preview */}
				{bookmarkCollections.length > 2 && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Collections
						</h2>
						<div className="flex flex-wrap gap-2">
							{bookmarkCollections.slice(0, 6).map((collection) => (
								<span
									key={collection.id}
									className="inline-flex rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-sm"
								>
									{collection.name}
								</span>
							))}
							{bookmarkCollections.length > 6 && (
								<span className="inline-flex rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-sm">
									+{bookmarkCollections.length - 6} more
								</span>
							)}
						</div>
					</div>
				)}

				{/* Daily Highlights */}
				{dailyHighlights.length > 0 && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Daily Highlights
						</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{dailyHighlights.map((article) => {
								const feed = feeds.find((f) => f.id === article.feedId);
								return (
									<ArticleCard
										key={article.id}
										id={article.id}
										title={article.title}
										excerpt={article.contentSnippet || article.content || ""}
										category={feed?.title || "RSS"}
										readTime={article.readTime || 5}
										author={feed?.title || "Unknown"}
										date={
											article.pubDate
												? new Date(article.pubDate).toLocaleDateString()
												: ""
										}
										liked={article.liked}
										saved={article.saved}
										imageUrl={article.imageUrl || undefined}
										imageData={article.imageData}
									/>
								);
							})}
						</div>
					</div>
				)}

				{/* Trending Articles */}
				{trendingArticles.length > 0 && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Trending This Week
						</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{trendingArticles.map((article) => {
								const feed = feeds.find((f) => f.id === article.feedId);
								return (
									<ArticleCard
										key={article.id}
										id={article.id}
										title={article.title}
										excerpt={article.contentSnippet || article.content || ""}
										category={feed?.title || "RSS"}
										readTime={article.readTime || 5}
										author={feed?.title || "Unknown"}
										date={
											article.pubDate
												? new Date(article.pubDate).toLocaleDateString()
												: ""
										}
										liked={article.liked}
										saved={article.saved}
										imageUrl={article.imageUrl || undefined}
										imageData={article.imageData}
									/>
								);
							})}
						</div>
					</div>
				)}

				{/* Reading Streak */}
				{currentStreak > 0 && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Reading Streak
						</h2>
						<div className="font-bold text-2xl text-primary">
							{currentStreak} day{currentStreak !== 1 ? "s" : ""}
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							Keep up the momentum!
						</p>
					</div>
				)}

				{/* Reading Stats */}
				{totalRead > 0 && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Reading Stats
						</h2>
						<div className="flex flex-col gap-2">
							<div className="flex justify-between">
								<span className="text-muted-foreground text-sm">
									Articles Read
								</span>
								<span className="font-semibold text-sm">{totalRead}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground text-sm">Liked</span>
								<span className="font-semibold text-sm">{totalLiked}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground text-sm">Saved</span>
								<span className="font-semibold text-sm">{totalSaved}</span>
							</div>
						</div>
					</div>
				)}

				{/* Pinned Items */}
				{(pinnedBookmarks.length > 0 || pinnedArticles.length > 0) && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							Pinned Items
						</h2>
						<div className="flex flex-col gap-3">
							{pinnedBookmarks.slice(0, 5).map((bookmark) => (
								<div
									key={bookmark.id}
									className="border-border border-b pb-3 last:border-0"
								>
									<h3 className="font-semibold text-sm">{bookmark.title}</h3>
									<p className="mt-1 text-muted-foreground text-xs">
										📌 Bookmark
									</p>
								</div>
							))}
							{pinnedArticles.slice(0, 5).map((article) => (
								<div
									key={article.id}
									className="border-border border-b pb-3 last:border-0"
								>
									<h3 className="font-semibold text-sm">{article.title}</h3>
									<p className="mt-1 text-muted-foreground text-xs">
										📌 Article
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Feed-specific Sections */}
				{articlesByFeed.some((f) => f.articles.length > 0) && (
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 font-semibold text-foreground text-xl">
							From Your Feeds
						</h2>
						<div className="flex flex-col gap-6">
							{articlesByFeed.map(
								({ feed, articles: feedArticles }) =>
									feedArticles.length > 0 && (
										<div key={feed.id}>
											<h3 className="mb-3 font-semibold text-lg">
												{feed.title}
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												{feedArticles.map((article) => (
													<ArticleCard
														key={article.id}
														id={article.id}
														title={article.title}
														excerpt={
															article.contentSnippet || article.content || ""
														}
														category={feed.title}
														readTime={article.readTime || 5}
														author={feed.title}
														date={
															article.pubDate
																? new Date(article.pubDate).toLocaleDateString()
																: ""
														}
														liked={article.liked}
														saved={article.saved}
														imageUrl={article.imageUrl || undefined}
													/>
												))}
											</div>
										</div>
									),
							)}
						</div>
					</div>
				)}
			</div>

			{/* Recent Activity */}
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
