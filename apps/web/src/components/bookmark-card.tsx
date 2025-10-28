import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Link as LinkIcon } from "lucide-react";

interface BookmarkCardProps {
	title: string;
	url: string;
}

export default function BookmarkCard({ title, url }: BookmarkCardProps) {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					<LinkIcon className="h-4 w-4" />
					<span className="truncate">{url}</span>
				</a>
			</CardContent>
		</Card>
	);
}
