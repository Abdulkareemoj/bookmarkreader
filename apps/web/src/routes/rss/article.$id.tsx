import { createFileRoute } from "@tanstack/react-router";
import ArticleDisplay from "@/components/article-display";

export const Route = createFileRoute("/rss/article/$id")({
  component: ArticlePageComponent,
});

function ArticlePageComponent() {
  const { id } = Route.useParams();

  // In a real app, you'd fetch the article based on the ID.
  // For now, we'll use the same hardcoded article.
  const article = {
    id: id,
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

  return (
    <main className="flex-1 overflow-y-auto">
      <ArticleDisplay {...article} />
    </main>
  );
}
