import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button variant="ghost" className="w-9 px-0" onClick={toggleTheme}>
				{theme === "dark" ? (
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
				) : (
					<Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
				)}
				<span className="sr-only">Toggle theme</span>
			</Button>
		</div>
	);
}
