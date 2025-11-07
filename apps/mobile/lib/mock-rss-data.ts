import type { Feed, Article } from "@packages/store";

export const mockFeeds: Omit<Feed, "unreadCount">[] = [
  {
    id: "f1",
    title: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    siteUrl: "https://techcrunch.com",
    lastFetched: new Date().toISOString(),
  },
  {
    id: "f2",
    title: "Hacker News",
    feedUrl: "https://hnrss.org/frontpage",
    siteUrl: "https://news.ycombinator.com",
    lastFetched: new Date().toISOString(),
  },
];

export const mockArticles: Article[] = [
  {
    id: "a1",
    feedId: "f1",
    title: "AI Startup Raises $100M in Series B",
    link: "https://techcrunch.com/ai-startup-raises",
    contentSnippet:
      "A new AI company focused on edge computing secured major funding.",
    pubDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: false,
    liked: false,
    saved: false,
  },
  {
    id: "a2",
    feedId: "f1",
    title: "The Future of Serverless Functions",
    link: "https://techcrunch.com/serverless-future",
    contentSnippet:
      "An in-depth look at how serverless architectures are changing cloud development.",
    pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    read: true,
    liked: true,
    saved: false,
  },
  {
    id: "a3",
    feedId: "f2",
    title: "Show HN: A new bookmark manager built with Tauri",
    link: "https://news.ycombinator.com/item?id=12345",
    contentSnippet:
      "Discussion thread about a new cross-platform bookmark tool.",
    pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
    liked: false,
    saved: true,
  },
];
