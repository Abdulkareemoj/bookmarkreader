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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Option } from '@/components/ui/multi-select'
import MultipleSelector from '@/components/ui/multi-select'

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
const categories: Option[] = [
  {
    value: 'clothing',
    label: 'Clothing'
  },
  {
    value: 'footwear',
    label: 'Footwear'
  },
  {
    value: 'accessories',
    label: 'Accessories'
  },
  {
    value: 'jewelry',
    label: 'Jewelry',
    disable: true
  },
  {
    value: 'outerwear',
    label: 'Outerwear'
  },
  {
    value: 'fragrance',
    label: 'Fragrance'
  },
  {
    value: 'makeup',
    label: 'Makeup'
  },
  {
    value: 'skincare',
    label: 'Skincare'
  },
  {
    value: 'furniture',
    label: 'Furniture'
  },
  {
    value: 'lighting',
    label: 'Lighting'
  },
  {
    value: 'kitchenware',
    label: 'Kitchenware',
    disable: true
  },
  {
    value: 'computers',
    label: 'Computers'
  },
  {
    value: 'audio',
    label: 'Audio'
  },
  {
    value: 'wearables',
    label: 'Wearables'
  },
  {
    value: 'supplements',
    label: 'Supplements'
  },
  {
    value: 'sportswear',
    label: 'Sportswear'
  }
]
export function AddBookmarkDialog({ onAddBookmark }: AddBookmarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewBookmarkData>({
    url: "",
    title: "",
    tags: "",
  });
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("inbox");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    // Convert selected tags to string array
    const tagsArray = selectedTags.map(tag => tag.value);

    // Use the passed prop function
    onAddBookmark({
      url: formData.url,
      title: formData.title || "Untitled Bookmark",
      tags: tagsArray,
      collectionId: selectedCollection,
    });

    // Reset form
    setFormData({ url: "", title: "", tags: "" });
    setSelectedTags([]);
    setSelectedCollection("inbox");
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
              <MultipleSelector
                commandProps={{
                  label: 'Select categories'
                }}
                value={selectedTags}
                defaultOptions={categories}
                onChange={setSelectedTags}
                placeholder='Select categories'
                hideClearAllButton
                hidePlaceholderWhenSelected
                emptyIndicator={<p className='text-center text-sm'>No results found</p>}
                className='col-span-3'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                Collection
              </Label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select a collection' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Collections</SelectLabel>
                    <SelectItem value='inbox'>Inbox</SelectItem>
                    <SelectItem value='work'>Work</SelectItem>
                    <SelectItem value='personal'>Personal</SelectItem>
                    <SelectItem value='reading'>Reading List</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
