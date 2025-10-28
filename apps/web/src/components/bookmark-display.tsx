import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";
import TagPill from "@/components/tag-pill";

interface BookmarkDisplayProps {
	id: string;
	title: string;
	url: string;
	notes?: string;
	tags?: string[];
}

export default function BookmarkDisplay({
	id,
	title,
	url,
	notes,
	tags = [],
}: BookmarkDisplayProps) {
	return (
		<article className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
			<Button
				variant="outline"
				size="sm"
				onClick={() => window.history.back()}
				className="mb-6 inline-flex items-center"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back
			</Button>

			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-balance font-bold text-4xl text-foreground leading-tight md:text-5xl">
						{title}
					</h1>
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<LinkIcon className="h-4 w-4" />
						<span>{url}</span>
					</a>
				</div>

				{notes && (
					<div className="prose prose-invert max-w-none">
						<p>{notes}</p>
					</div>
				)}

				{tags.length > 0 && (
					<div className="border-border border-t py-6">
						<p className="mb-3 font-semibold text-muted-foreground text-sm">
							Tags
						</p>
						<div className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<TagPill key={tag} label={tag} variant="secondary" />
							))}
						</div>
					</div>
				)}
			</div>
		</article>
	);
}
