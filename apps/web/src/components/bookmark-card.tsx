import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";

interface BookmarkCardProps {
  title: string;
  url: string;
}

export default function BookmarkCard({ title, url }: BookmarkCardProps) {
  return (
    <Card className="px-4 py-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <LinkIcon className="h-4 w-4" />
          <span className="truncate">{url}</span>
        </div>
      </CardContent>
    </Card>
  );
}
