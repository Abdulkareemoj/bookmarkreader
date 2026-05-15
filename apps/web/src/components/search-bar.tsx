import { useNavigate } from "@tanstack/react-router";
import {
	Bookmark,
	Compass,
	Home,
	Monitor,
	Moon,
	Rss,
	Search,
	Settings,
	Sun,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
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
			<InputGroup>
				<Search className="text-muted-foreground" data-icon="inline-start" />
				<InputGroupInput
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						onSearch(e.target.value);
					}}
					onClick={() => setOpen(true)}
					placeholder={placeholder}
					className="cursor-pointer"
				/>
				{query && (
					<InputGroupAddon>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClear}
							className="size-6"
						>
							<X data-icon="inline-start" />
						</Button>
					</InputGroupAddon>
				)}
			</InputGroup>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<Command>
					<CommandInput placeholder="Type a command or search..." />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						{/* Navigation */}
						<CommandGroup heading="Navigation">
							<CommandItem onSelect={() => handleNavigate("/")}>
								<Home data-icon="inline-start" />
								<span>Home</span>
								<CommandShortcut>
									<Kbd>⌘G</Kbd>
								</CommandShortcut>
							</CommandItem>
							<CommandItem onSelect={() => handleNavigate("/bookmarks")}>
								<Bookmark data-icon="inline-start" />
								<span>Bookmarks</span>
								<CommandShortcut>
									<Kbd>⌘B</Kbd>
								</CommandShortcut>
							</CommandItem>
							<CommandItem onSelect={() => handleNavigate("/rss")}>
								<Rss data-icon="inline-start" />
								<span>RSS Feeds</span>
								<CommandShortcut>
									<Kbd>⌘R</Kbd>
								</CommandShortcut>
							</CommandItem>
							<CommandItem onSelect={() => handleNavigate("/explore")}>
								<Compass data-icon="inline-start" />
								<span>Explore</span>
								<CommandShortcut>
									<Kbd>⌘E</Kbd>
								</CommandShortcut>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						{/* Theme */}
						<CommandGroup heading="Theme">
							<CommandItem onSelect={() => handleThemeChange("light")}>
								<Sun data-icon="inline-start" />
								<span>Light Mode</span>
							</CommandItem>
							<CommandItem onSelect={() => handleThemeChange("dark")}>
								<Moon data-icon="inline-start" />
								<span>Dark Mode</span>
							</CommandItem>
							<CommandItem onSelect={() => handleThemeChange("system")}>
								<Monitor data-icon="inline-start" />
								<span>System Theme</span>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						{/* Settings */}
						<CommandGroup heading="Settings">
							<CommandItem onSelect={() => handleNavigate("/settings")}>
								<Settings data-icon="inline-start" />
								<span>Settings</span>
								<CommandShortcut>
									<Kbd>⌘,</Kbd>
								</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}
