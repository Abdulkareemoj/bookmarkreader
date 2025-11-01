import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import ArticleDisplay from "@/components/article-display";
import ArticleListView from "@/components/article-list-view";

export const Route = createFileRoute("/rss/")({
	component: RssComponent,
});

function RssComponent() {
	const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
    const collection = useRouterState({ select: (s) => (s.location.search as any)?.collection ?? "all" });

	const article = {
		id: "1",
		title: "The Future of Web Development",
		subtitle:
			"Exploring emerging technologies and best practices shaping the next generation of web applications.",
		category: "Technology",
		readTime: 5,
		author: "Sarah Chen",
		date: "Oct 20, 2025",
		content: `The web development landscape continues to evolve at a rapid pace. With new frameworks, tools, and methodologies emerging constantly, developers must stay informed about the latest trends and best practices.

## Key Trends to Watch

Several important trends are shaping the future of web development. Server-side rendering, edge computing, and AI-powered development tools are becoming increasingly important in modern applications.

- AI-assisted code generation and debugging
- Edge computing and serverless architectures
- Enhanced performance optimization techniques
- Improved developer experience and tooling

## Best Practices

Following established best practices ensures your applications are maintainable, performant, and secure. Focus on clean code, proper testing, and continuous learning.

The future of web development is exciting and full of possibilities. By staying informed and adapting to new technologies, developers can build better applications that serve users more effectively.`,
		tags: ["Web Development", "AI", "Performance", "Best Practices"],
	}

    const rssItems = [
		{
			id: "r1",
			title: "New AI Model Breaks Records",
			subtitle: "Latest breakthrough in machine learning",
            category: "AI",
			readTime: 5,
			author: "Tech News Daily",
			date: "Oct 20, 2025",
			tags: ["AI", "Machine Learning"],
		},
		{
			id: "r2",
			title: "Web Performance Tips",
			subtitle: "Optimize your website for speed",
			category: "Technology",
			readTime: 7,
			author: "Web Dev Weekly",
			date: "Oct 19, 2025",
			tags: ["Performance", "Web Development"],
		},
		{
			id: "r3",
			title: "Startup Funding Trends",
			subtitle: "Analysis of Q4 funding landscape",
			category: "Business",
			readTime: 6,
			author: "Business Insider",
			date: "Oct 18, 2025",
			tags: ["Startups", "Funding"],
		},
    ]

    const filtered = Array.isArray(rssItems)
        ? rssItems.filter((a) => {
              if (!collection || collection === "all") return true;
              const q = String(collection).toLowerCase();
              return (
                  a.category.toLowerCase() === q ||
                  a.tags?.some((t) => t.toLowerCase() === q)
              );
          })
        : rssItems;

	if (selectedArticle) {
		return (
			<main className="flex-1 overflow-y-auto">
				<ArticleDisplay {...article} />
			</main>
		)
	}

	return (
		<main className="flex-1 overflow-hidden">
			<ArticleListView
                articles={filtered}
				onArticleSelect={(article) => setSelectedArticle(article.id)}
			/>
		</main>
	)
}
