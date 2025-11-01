import { Link, useMatchRoute } from "@tanstack/react-router";
import { Home, BookMarked, Rss, Compass } from "lucide-react";

export default function BottomNav() {
	const matchRoute = useMatchRoute();

	const items = [
		{ to: "/", label: "Home", icon: Home },
		{ to: "/bookmarks", label: "Bookmarks", icon: BookMarked },
		{ to: "/rss", label: "RSS", icon: Rss },
		{ to: "/explore", label: "Explore", icon: Compass },
	];

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-border border-t bg-background/95 backdrop-blur md:hidden">
			<ul className="grid grid-cols-4">
				{items.map(({ to, label, icon: Icon }) => {
					const active = !!matchRoute({ to });
					return (
						<li key={to}>
							<Link
								to={to as any}
								className={`flex flex-col items-center justify-center py-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
							>
								<Icon className="mb-1 h-5 w-5" />
								<span>{label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
