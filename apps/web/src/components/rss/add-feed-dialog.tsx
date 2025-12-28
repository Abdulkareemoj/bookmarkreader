import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeeds } from "@/hooks/use-feeds";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

// Define the shape of the form data
interface NewFeedData {
  feedUrl: string;
  title: string;
}

export function AddFeedDialog() {
  const { addFeed } = useFeeds();
  const feedUrlId = useId();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewFeedData>({
    feedUrl: "",
    title: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feedUrl) return;

    // In a real application, we would fetch and parse the feed here to get the title and articles.
    // For now, we use mock data and generate a simple ID.
    const newFeed = {
      title: formData.title || "Untitled Feed",
      feedUrl: formData.feedUrl,
      siteUrl: new URL(formData.feedUrl).origin,
    };

    void addFeed(newFeed);

    // Reset form and close dialog
    setFormData({ feedUrl: "", title: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New RSS Feed</DialogTitle>
          <DialogDescription>
            Enter the URL of the RSS feed you want to subscribe to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedUrl" className="text-right">
                Feed URL
              </Label>
              <Input
                id={feedUrlId}
                name="feedUrl"
                placeholder="https://example.com/feed.xml"
                value={formData.feedUrl}
                onChange={handleChange}
                required
                type="url"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id={titleId}
                name="title"
                placeholder="Optional title (e.g., My Blog)"
                value={formData.title}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!formData.feedUrl}>
              Add Feed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
