import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Search, X, Home, Bookmark, Rss, Settings, Moon, Sun, Monitor, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { Kbd } from "./ui/kbd";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search articles...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path as any });
    setOpen(false);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <>
      <div className="relative w-full">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md bg-muted py-2 pr-10 pl-10 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-accent/50 transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Navigation */}
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => handleNavigate("/")} className="hover:bg-accent">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
                <CommandShortcut><Kbd>⌘G</Kbd></CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("/bookmarks")} className="hover:bg-accent">
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Bookmarks</span>
                <CommandShortcut><Kbd>⌘B</Kbd></CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("/rss")} className="hover:bg-accent">
                <Rss className="mr-2 h-4 w-4" />
                <span>RSS Feeds</span>
                <CommandShortcut><Kbd>⌘R</Kbd></CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("/explore")} className="hover:bg-accent">
                <Compass className="mr-2 h-4 w-4" />
                <span>Explore</span>
                <CommandShortcut><Kbd>⌘E</Kbd></CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Theme */}
            <CommandGroup heading="Theme">
              <CommandItem onSelect={() => handleThemeChange("light")} className="hover:bg-accent">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light Mode</span>
              </CommandItem>
              <CommandItem onSelect={() => handleThemeChange("dark")} className="hover:bg-accent">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark Mode</span>
              </CommandItem>
              <CommandItem onSelect={() => handleThemeChange("system")} className="hover:bg-accent">
                <Monitor className="mr-2 h-4 w-4" />
                <span>System Theme</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Settings */}
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => handleNavigate("/settings")} className="hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut><Kbd>⌘,</Kbd></CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
