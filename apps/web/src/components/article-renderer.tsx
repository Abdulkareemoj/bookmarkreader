import { useMemo } from "react";

interface ArticleRendererProps {
	content: string;
	className?: string;
}

export default function ArticleRenderer({
	content,
	className = "",
}: ArticleRendererProps) {
	const renderedContent = useMemo(() => {
		return content.split("\n\n").map((block, idx) => {
			// Handle headings
			if (block.startsWith("# ")) {
				return (
					<h1
						key={idx}
						className="mt-8 mb-4 font-bold text-4xl text-foreground"
					>
						{block.replace(/^#+\s/, "").trim()}
					</h1>
				);
			}
			if (block.startsWith("## ")) {
				return (
					<h2
						key={idx}
						className="mt-6 mb-3 font-bold text-2xl text-foreground"
					>
						{block.replace(/^#+\s/, "").trim()}
					</h2>
				);
			}
			if (block.startsWith("### ")) {
				return (
					<h3
						key={idx}
						className="mt-4 mb-2 font-semibold text-foreground text-xl"
					>
						{block.replace(/^#+\s/, "").trim()}
					</h3>
				);
			}

			// Handle lists
			if (block.startsWith("- ")) {
				const items = block
					.split("\n")
					.filter((line) => line.trim().startsWith("- "));
				return (
					<ul key={idx} className="my-4 ml-6 space-y-2">
						{items.map((item, itemIdx) => (
							<li key={itemIdx} className="flex gap-3">
								<span className="flex-shrink-0 font-bold text-primary">•</span>
								<span className="text-foreground">
									{item.replace(/^-\s/, "").trim()}
								</span>
							</li>
						))}
					</ul>
				);
			}

			// Handle blockquotes
			if (block.startsWith("> ")) {
				return (
					<blockquote
						key={idx}
						className="my-4 border-primary border-l-4 py-2 pl-4 text-muted-foreground italic"
					>
						{block.replace(/^>\s/, "").trim()}
					</blockquote>
				);
			}

			// Handle code blocks
			if (block.startsWith("```")) {
				const codeContent = block
					.replace(/```[\w]*\n?/, "")
					.replace(/```$/, "");
				return (
					<pre
						key={idx}
						className="my-4 overflow-x-auto rounded-lg bg-muted p-4"
					>
						<code className="font-mono text-foreground text-sm">
							{codeContent}
						</code>
					</pre>
				);
			}

			// Regular paragraphs
			if (block.trim()) {
				return (
					<p key={idx} className="my-4 text-foreground text-lg leading-relaxed">
						{block.trim()}
					</p>
				);
			}

			return null;
		});
	}, [content]);

	return (
		<div className={`prose prose-invert max-w-none ${className}`}>
			{renderedContent}
		</div>
	);
}
