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
import { Plus } from "lucide-react";
import { useState } from "react";

// Define the shape of the form data
interface NewBookmarkData {
  url: string;
  title: string;
  tags: string; // Comma-separated string for simplicity
}

// Define props for the dialog
interface AddBookmarkDialogProps {
  onAddBookmark: (data: {
    url: string;
    title: string;
    tags: string[];
    collectionId: string;
  }) => void;
}

export function AddBookmarkDialog({ onAddBookmark }: AddBookmarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewBookmarkData>({
    url: "",
    title: "",
    tags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    // Simple logic to convert comma-separated string to array
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Use the passed prop function
    onAddBookmark({
      url: formData.url,
      title: formData.title || "Untitled Bookmark",
      tags: tagsArray,
      collectionId: "all", // Default to 'all' for now
    });

    // Reset form and close dialog
    setFormData({ url: "", title: "", tags: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Enter the details for the new bookmark. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleChange}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Optional title"
                value={formData.title}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!formData.url}>
              Save Bookmark
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
