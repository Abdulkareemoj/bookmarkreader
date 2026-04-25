import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Toolbar() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	return (
		<header className="border-border border-b bg-background">
			<div className="flex h-16 items-center justify-between px-4 md:px-6">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<SidebarTrigger />
					{/* <div className="hidden font-semibold text-foreground text-lg sm:block">
            <h2> Today's Articles</h2>
          </div> */}
				</div>

				{/* Center Section - Search */}
				<div className="mx-4 hidden max-w-md flex-1 md:flex">
					<SearchBar
						placeholder="Search..."
						onSearch={(q) => {
							void navigate({
								to: location.pathname as any,
								search: (prev: any) => ({ ...prev, q }),
								replace: true,
							});
						}}
					/>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					<Button variant="ghost" className="w-9 px-0" onClick={toggleTheme}>
						{theme === "dark" ? (
							<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
						) : (
							<Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
						)}
						<span className="sr-only">Toggle theme</span>
					</Button>
					{/* <Button variant="outline" size="sm" title="Settings">
						<Settings className="size-5" />
					</Button> */}
				</div>
			</div>
		</header>
	);
}
