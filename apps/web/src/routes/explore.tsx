import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Bookmark,
	BookOpen,
	Film,
	Heart,
	Plus,
	Rss,
	Search,
	Shuffle,
	TrendingUp,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArticleCard from "@/components/rss/article-card";
import {
	curatedFeedsByCategory,
	getAllCuratedFeeds,
	getCategories,
	getRandomFeeds,
	discoverYouTubeChannelFeed,
	parseYouTubeChannelUrl,
} from "@packages/utils";
import { useReaderStore } from "@/lib/store";

export const Route = createFileRoute("/explore")({
	component: Explore,
});

function EmptyCard({
	icon: Icon,
	title,
	desc,
	action,
}: {
	icon: React.ElementType;
	title: string;
	desc: string;
	action?: { label: string; onClick: () => void };
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
			<div className="mb-1 flex size-9 items-center justify-center rounded-xl border bg-muted/40">
				<Icon data-icon="inline-start" className="text-muted-foreground" />
			</div>
			<p className="font-medium text-foreground text-sm">{title}</p>
			<p className="max-w-[240px] text-muted-foreground text-sm leading-relaxed">
				{desc}
			</p>
			{action && (
				<Button
					type="button"
					onClick={action.onClick}
					size="sm"
					className="mt-2"
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}

function SectionCard({
	title,
	subtitle,
	icon: Icon,
	children,
}: {
	title: string;
	subtitle: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<Card className="rounded-xl">
			<CardHeader className="flex flex-col gap-1">
				<CardTitle className="flex items-center gap-2 text-base">
					<Icon data-icon="inline-start" className="text-primary" />
					<span>{title}</span>
				</CardTitle>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function ArticleList({ ids }: { ids: string[] }) {
	const navigate = useNavigate();
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
			{ids.map((id) => {
				const article = articles.find((a) => a.id === id);
				if (!article) return null;
				const feed = feeds.find((f) => f.id === article.feedId);
				const readTime = (article as any).readTime ?? 5;
				return (
					<ArticleCard
						key={article.id}
						id={article.id}
						title={article.title}
						excerpt={article.contentSnippet || article.content || ""}
						category={feed?.title || "RSS"}
						readTime={readTime}
						author={feed?.title || "Unknown"}
						date={
							article.pubDate
								? new Date(article.pubDate).toLocaleDateString()
								: ""
						}
						liked={article.liked}
						saved={article.saved}
						imageUrl={article.imageUrl || undefined}
						feedFavicon={
							feed?.siteUrl
								? `https://www.google.com/s2/favicons?domain=${new URL(feed.siteUrl).hostname}&sz=64`
								: undefined
						}
						onClick={() =>
							navigate({
								to: "/rss/article/$id",
								params: { id: article.id },
							})
						}
					/>
				);
			})}
		</div>
	);
}

function Explore() {
	const articles = useReaderStore((state) => state.articles);
	const feeds = useReaderStore((state) => state.feeds);
	const addFeed = useReaderStore((state) => state.addFeed);
	const [discoverSearch, setDiscoverSearch] = useState("");
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [youtubeLoading, setYoutubeLoading] = useState(false);
	const [youtubeError, setYoutubeError] = useState("");
	const [randomFeeds, setRandomFeeds] = useState(getRandomFeeds(6));
	const [selectedCategory, setSelectedCategory] = useState<string | "all">(
		"all",
	);

	const readArticles = articles.filter((a) => a.read).length;
	const likedArticlesCount = articles.filter((a) => a.liked).length;
	const savedArticlesCount = articles.filter((a) => a.saved).length;
	const totalArticles = articles.length;

	const stats = [
		{
			icon: BookOpen,
			label: "Articles read",
			value: readArticles,
		},
		{
			icon: Heart,
			label: "Articles liked",
			value: likedArticlesCount,
		},
		{
			icon: Bookmark,
			label: "Articles saved",
			value: savedArticlesCount,
		},
		{
			icon: Rss,
			label: "Total articles",
			value: totalArticles,
		},
	];

	const bestArticleIds = articles
		.filter((a) => !a.read)
		.sort(
			(a, b) =>
				new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime(),
		)
		.slice(0, 4)
		.map((a) => a.id);

	const recommendedIds = articles
		.filter((a) => a.liked)
		.slice(0, 4)
		.map((a) => a.id);

	const backlogIds = articles
		.filter((a) => a.saved && !a.read)
		.slice(0, 4)
		.map((a) => a.id);

	const categories = getCategories();

	const filteredFeeds =
		selectedCategory === "all"
			? getAllCuratedFeeds()
			: curatedFeedsByCategory[selectedCategory] || [];

	const searchedFeeds = discoverSearch
		? filteredFeeds.filter(
				(f) =>
					f.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
					f.description.toLowerCase().includes(discoverSearch.toLowerCase()),
			)
		: filteredFeeds;

	const handleAddFeed = async (url: string, title: string) => {
		await addFeed({ feedUrl: url, title });
	};

	const handleRandomFeeds = () => {
		setRandomFeeds(getRandomFeeds(6));
	};

	const handleYouTubeSubscribe = async () => {
		setYoutubeError("");
		const { normalizedUrl, isValid } = parseYouTubeChannelUrl(youtubeUrl);
		if (!isValid || !normalizedUrl) {
			setYoutubeError("Invalid YouTube channel URL");
			return;
		}
		const feedInfo = await discoverYouTubeChannelFeed(normalizedUrl);
		if (!feedInfo) {
			setYoutubeError("Could not find RSS feed for this channel");
			return;
		}
		setYoutubeLoading(true);
		try {
			// Try platform-specific handle resolver if available (e.g. Tauri Rust command)
			let resolvedUrl = feedInfo.feedUrl;
			if (feedInfo.requiresChannelId) {
				const platformResolve = (window as any)
					.__RESOLVE_YOUTUBE_HANDLE__ as
					| ((handle: string) => Promise<string | null>)
					| undefined;
				if (platformResolve) {
					const platformUrl = await platformResolve(youtubeUrl);
					if (platformUrl) resolvedUrl = platformUrl;
				}
			}
			await handleAddFeed(resolvedUrl, feedInfo.title);
			setYoutubeUrl("");
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Failed to subscribe";
			if (feedInfo.requiresChannelId) {
				setYoutubeError(
					`${msg} Try the channel URL in /channel/UC... format instead (some handles don't have matching RSS feeds).`,
				);
			} else {
				setYoutubeError(msg);
			}
		} finally {
			setYoutubeLoading(false);
		}
	};

	return (
		<div className="p-4 md:p-8 overflow-x-hidden">
			<div id="overview" className=" is-shown mb-6">
				<h1 className=" truncate font-semibold text-2xl text-foreground">
					Explore
				</h1>
				<p className="mt-1 text-muted-foreground">
					Discover useful shortcuts and fresh content from your feeds.
				</p>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((s) => (
					<Card key={s.label} className="rounded-xl">
						<CardContent className="p-4">
							<div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-muted">
								<s.icon
									data-icon="inline-start"
									className="text-muted-foreground"
								/>
							</div>
							<div className="font-semibold text-2xl text-foreground leading-none">
								{s.value}
							</div>
							<div className="mt-1 text-muted-foreground text-xs uppercase tracking-wide">
								{s.label}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<section id="trending">
					<SectionCard
						icon={Rss}
						title="Trending now"
						subtitle="Latest unread articles across all sources"
					>
						{bestArticleIds.length > 0 ? (
							<ArticleList ids={bestArticleIds} />
						) : (
							<EmptyCard
								icon={Rss}
								title="No feeds yet"
								desc="Add some feeds to see articles here"
								action={{
									label: "+ Add feed",
									onClick: () =>
										document
											.getElementById("directory")
											?.scrollIntoView({ behavior: "smooth" }),
								}}
							/>
						)}
					</SectionCard>
				</section>
				<section id="recommended">
					<SectionCard
						icon={TrendingUp}
						title="Recommended for you"
						subtitle="Personalised recommendations from your activity"
					>
						{recommendedIds.length > 0 ? (
							<ArticleList ids={recommendedIds} />
						) : (
							<EmptyCard
								icon={Heart}
								title="Nothing yet"
								desc="Like some articles to get personalised recommendations"
							/>
						)}
					</SectionCard>
				</section>
			</div>

			<section id="backlog" className="mb-6">
				<SectionCard
					icon={Bookmark}
					title="Saved backlog"
					subtitle="Articles you've marked to read later"
				>
					{backlogIds.length > 0 ? (
						<ArticleList ids={backlogIds} />
					) : (
						<EmptyCard
							icon={Bookmark}
							title="All caught up"
							desc="No unread saved articles â€” you're on top of it"
						/>
					)}
				</SectionCard>
			</section>

			{/* YouTube Subscription */}
			<Card id="youtube" className="mb-6 rounded-xl w-full">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<Film data-icon="inline-start" className="text-red-500" />
						<span>Subscribe to YouTube Channels</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Enter a YouTube channel URL or handle to subscribe via RSS
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2 min-w-0">
						<Input
							placeholder="e.g. https://youtube.com/@mkbhd"
							value={youtubeUrl}
							onChange={(e) => {
								setYoutubeUrl(e.target.value);
								setYoutubeError("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleYouTubeSubscribe();
							}}
							className="flex-1 min-w-0"
						/>
						<Button
							onClick={handleYouTubeSubscribe}
							disabled={youtubeLoading || !youtubeUrl.trim()}
						>
							{youtubeLoading ? <Spinner className="size-4" /> : "Subscribe"}
						</Button>
					</div>
					{youtubeError && (
						<p className="mt-2 text-red-500 text-sm">{youtubeError}</p>
					)}
					<p className="mt-2 text-muted-foreground text-xs">
						Supports youtube.com/channel/UC... (best), youtube.com/@handle, or
						bare @handle. Some handles require the /channel/UC... format.
					</p>
				</CardContent>
			</Card>

			{/* Surprise Me */}
			<Card id="surprise" className="mb-6 rounded-xl w-full">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<Shuffle data-icon="inline-start" className="text-primary" />
						<span>Surprise Me</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Not sure what to follow? Try a random pick
					</p>
				</CardHeader>
				<CardContent>
					<div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{randomFeeds.map((feed) => {
							const alreadySubscribed = feeds.some(
								(f) => f.feedUrl === feed.url,
							);
							return (
								<div
									key={feed.name}
									className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent"
								>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm">
										{feed.icon}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex min-w-0 items-center gap-2">
											<span className="truncate font-medium text-foreground text-sm">
												{feed.name}
											</span>
											<Badge
												variant="secondary"
												className="text-[10px] shrink-0"
											>
												{feed.category}
											</Badge>
										</div>
										<p className="mt-0.5 truncate text-muted-foreground text-sm">
											{feed.description}
										</p>
									</div>
									<Button
										type="button"
										variant={alreadySubscribed ? "secondary" : "ghost"}
										size="icon"
										className="size-8 shrink-0"
										disabled={alreadySubscribed}
										onClick={() => handleAddFeed(feed.url, feed.name)}
									>
										<Plus data-icon="inline-start" />
									</Button>
								</div>
							);
						})}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRandomFeeds}
						className="w-full"
					>
						<Shuffle data-icon="inline-start" className="mr-2" />
						Shuffle
					</Button>
				</CardContent>
			</Card>

			{/* Feed Directory */}
			{/* <Card id="directory" className="rounded-xl w-full">
				<CardHeader className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp data-icon="inline-start" className="text-primary" />
						<span>Feed Directory</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Browse curated sources worth following
					</p>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex items-center gap-2">
						<div className="relative flex-1 min-w-0">
							<Search
								data-icon="inline-start"
								className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							/>
							<Input
								placeholder="Search feeds..."
								value={discoverSearch}
								onChange={(e) => setDiscoverSearch(e.target.value)}
								className="pl-9 w-full min-w-0"
							/>
						</div>
					</div>

					<Tabs
						value={selectedCategory}
						onValueChange={(v) => setSelectedCategory(v)}
						className="w-full"
					>
						<div className="mb-4 overflow-x-auto scrollbar-none">
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								{categories.map((cat) => (
									<TabsTrigger key={cat} value={cat}>
										{cat}
									</TabsTrigger>
								))}
							</TabsList>
						</div>

						<TabsContent
							value={selectedCategory}
							className="mt-0 min-h-[300px]"
						>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full">
								{searchedFeeds.map((feed) => {
									const alreadySubscribed = feeds.some(
										(f) => f.feedUrl === feed.url,
									);
									return (
										<div
											key={feed.name}
											className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors hover:bg-accent"
										>
											<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm">
												{feed.icon}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex min-w-0 items-center gap-2">
													<span className="truncate font-medium text-foreground text-sm">
														{feed.name}
													</span>
													<Badge
														variant="secondary"
														className="text-[10px] shrink-0"
													>
														{feed.category}
													</Badge>
												</div>
												<p className="mt-0.5 truncate text-muted-foreground text-sm">
													{feed.description}
												</p>
											</div>
											<Button
												type="button"
												variant={alreadySubscribed ? "secondary" : "ghost"}
												size="icon"
												className="size-8 shrink-0"
												disabled={alreadySubscribed}
												onClick={() => handleAddFeed(feed.url, feed.name)}
											>
												<Plus data-icon="inline-start" />
											</Button>
										</div>
									);
								})}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card> */}
		</div>
	);
}
