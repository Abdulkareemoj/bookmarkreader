import { useState } from "react";
import ArticleDisplay from "@/components/article-display";
import ArticleListView from "@/components/article-list-view";

interface ReaderContentProps {
	activeTab: string;
}

export default function ReaderContent({ activeTab }: ReaderContentProps) {
	const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

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
	};

	const bookmarks = [
		{
			id: "b1",
			title: "React Documentation",
			subtitle: "Official React docs and guides",
			category: "Technology",
			readTime: 10,
			author: "React Team",
			date: "Oct 15, 2025",
			tags: ["React", "JavaScript"],
		},
		{
			id: "b2",
			title: "Next.js Best Practices",
			subtitle: "Learn how to build performant Next.js applications",
			category: "Technology",
			readTime: 8,
			author: "Vercel",
			date: "Oct 18, 2025",
			tags: ["Next.js", "Web Development"],
		},
		{
			id: "b3",
			title: "TypeScript Advanced Types",
			subtitle: "Master advanced TypeScript patterns",
			category: "Technology",
			readTime: 12,
			author: "TypeScript Team",
			date: "Oct 19, 2025",
			tags: ["TypeScript", "Programming"],
		},
	];

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
	];

	if (selectedArticle) {
		return (
			<main className="flex-1 overflow-y-auto">
				<ArticleDisplay {...article} />
			</main>
		);
	}

	return (
		<main className="flex-1 overflow-hidden">
			{activeTab === "bookmarks" && (
				<ArticleListView
					articles={bookmarks}
					onArticleSelect={(article) => setSelectedArticle(article.id)}
				/>
			)}

			{activeTab === "rss" && (
				<ArticleListView
					articles={rssItems}
					onArticleSelect={(article) => setSelectedArticle(article.id)}
				/>
			)}

			{activeTab === "explore" && (
				<div className="flex h-full items-center justify-center">
					<div className="text-center">
						<h2 className="mb-2 font-bold text-2xl text-foreground">Explore</h2>
						<p className="text-foreground/60">Coming soon...</p>
					</div>
				</div>
			)}
		</main>
	);
}
