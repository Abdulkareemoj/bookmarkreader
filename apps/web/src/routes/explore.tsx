import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, BookOpen, Heart, Plus, Rss, TrendingUp } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/explore")({
	component: Explore,
});

const stats = [
	{ icon: BookOpen, label: "Articles read", value: 0 },
	{ icon: Heart, label: "Articles liked", value: 0 },
	{ icon: Bookmark, label: "Articles saved", value: 0 },
	{ icon: Rss, label: "Total articles", value: 0 },
];

const suggestedFeeds = [
	{
		icon: "🔶",
		name: "Hacker News",
		desc: "Top stories from tech & startups",
		tag: "Tech",
		url: "https://news.ycombinator.com/rss",
	},
	{
		icon: "🟣",
		name: "r/programming",
		desc: "Computer programming discussion",
		tag: "Tech",
		url: "https://www.reddit.com/r/programming/.rss",
	},
	{
		icon: "🌐",
		name: "r/webdev",
		desc: "Web development news",
		tag: "Dev",
		url: "https://www.reddit.com/r/webdev/.rss",
	},
	{
		icon: "🔨",
		name: "Smashing Magazine",
		desc: "Web design & development",
		tag: "Design",
		url: "https://www.smashingmagazine.com/feed",
	},
	{
		icon: "⭐",
		name: "CSS-Tricks",
		desc: "Tips, tricks, and techniques on CSS",
		tag: "CSS",
		url: "https://css-tricks.com/feed",
	},
	{
		icon: "▲",
		name: "Vercel Blog",
		desc: "Updates from the Vercel team",
		tag: "Dev",
		url: "https://vercel.com/atom",
	},
	{
		icon: "🔵",
		name: "The Verge",
		desc: "Tech, science, and culture",
		tag: "Tech",
		url: "https://www.theverge.com/rss/index.xml",
	},
	{
		icon: "🔴",
		name: "Ars Technica",
		desc: "Technology news and analysis",
		tag: "Tech",
		url: "https://feeds.arstechnica.com/arstechnica/index",
	},
];

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
			<div className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl border bg-muted/40">
				<Icon className="h-4 w-4 text-muted-foreground" />
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
	)
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
			<CardHeader className="space-y-1">
				<CardTitle className="flex items-center gap-2 text-base">
					<Icon className="h-4 w-4 text-primary" />
					<span>{title}</span>
				</CardTitle>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}

function Explore() {
	return (
		<div className="flex h-full flex-col p-6">
			<div className="mb-6">
				<h1 className="truncate font-semibold text-2xl text-foreground">
					Explore
				</h1>
				<p className="mt-1 text-muted-foreground">
					Discover content and insights from your feeds
				</p>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((s) => (
					<Card key={s.label} className="rounded-xl">
						<CardContent className="p-4">
							<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
								<s.icon className="h-4 w-4 text-muted-foreground" />
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

			{/* Best of feeds + Recommendations */}
			<div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SectionCard
					icon={Rss}
					title="Best of your feeds"
					subtitle="Latest unread articles across all sources"
				>
					<EmptyCard
						icon={Rss}
						title="No feeds yet"
						desc="Add some feeds to see articles here"
						action={{ label: "+ Add feed", onClick: () => {} }}
					/>
				</SectionCard>

				<SectionCard
					icon={TrendingUp}
					title="Read more like this"
					subtitle="Personalised recommendations from your activity"
				>
					<EmptyCard
						icon={Heart}
						title="Nothing yet"
						desc="Like some articles to get personalised recommendations"
					/>
				</SectionCard>
			</div>

			{/* Your backlog */}
			<div className="mb-6">
				<SectionCard
					icon={Bookmark}
					title="Your backlog"
					subtitle="Saved articles you haven't read yet"
				>
					<EmptyCard
						icon={Bookmark}
						title="All caught up"
						desc="No unread saved articles — you're on top of it"
					/>
				</SectionCard>
			</div>

			{/* Discover feeds */}
			<Card className="rounded-xl">
				<CardHeader className="space-y-1">
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-4 w-4 text-primary" />
						<span>Discover feeds</span>
					</CardTitle>
					<p className="text-muted-foreground text-sm">
						Curated sources worth following
					</p>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{suggestedFeeds.map((feed) => (
							<div
								key={feed.name}
								className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors hover:bg-accent"
							>
								<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-muted text-sm">
									{feed.icon}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="truncate font-medium text-foreground text-sm">
											{feed.name}
										</span>
										<Badge variant="secondary" className="text-[10px]">
											{feed.tag}
										</Badge>
									</div>
									<p className="mt-0.5 truncate text-muted-foreground text-sm">
										{feed.desc}
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
