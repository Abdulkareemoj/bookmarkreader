
import { Button } from "@workspace/ui/components/button";
import { Menu, Moon, Search, Settings, Sun } from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
	onToggleSidebar: () => void;
}

export default function Toolbar({ onToggleSidebar }: ToolbarProps) {
	const [isDark, setIsDark] = useState(false);

	return (
		<header className="border-border border-b bg-background">
			<div className="flex h-16 items-center justify-between px-4 md:px-6">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleSidebar}
						className="md:hidden"
					>
						<Menu className="h-5 w-5" />
					</Button>
					<h2 className="hidden font-semibold text-foreground text-lg sm:block">
						Today's Articles
					</h2>
				</div>

				{/* Center Section - Search */}
				<div className="mx-4 hidden max-w-md flex-1 md:flex">
					<div className="relative w-full">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search articles..."
							className="w-full rounded-md bg-muted py-2 pr-4 pl-10 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsDark(!isDark)}
						title="Toggle dark mode"
					>
						{isDark ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>
					<Button variant="ghost" size="icon" title="Settings">
						<Settings className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</header>
	);
}
