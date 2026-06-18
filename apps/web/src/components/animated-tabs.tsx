import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import { Bookmark, Compass, Rss } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabs = [
	{
		name: "Bookmarks",
		value: "/bookmarks",
		icon: Bookmark,
	},
	{
		name: "RSS",
		value: "/rss",
		icon: Rss,
	},
	{
		name: "Explore",
		value: "/explore",
		icon: Compass,
	},
];

export default function AnimatedTabs() {
	const matchRoute = useMatchRoute();
	const router = useRouterState();

	return (
		<div className="w-full">
			<Tabs value={router.location.pathname} className="gap-4">
				<TabsList className="h-auto w-full gap-2 rounded-lg bg-sidebar-accent p-1">
					{tabs.map(({ icon: Icon, name, value }) => {
						const isActive = matchRoute({ to: value, fuzzy: true });

						return (
							<Link to={value} key={value} className="flex-1">
								<TabsTrigger value={value} asChild>
									<div
										className={cn(
											"flex h-8 w-full items-center justify-center gap-2 rounded-md px-3 transition-colors",
											isActive && "bg-background shadow-sm",
										)}
									>
										<Icon data-icon="inline-start" className="shrink-0" />
										<AnimatePresence initial={false}>
											{isActive && (
												<motion.span
													className="whitespace-nowrap font-medium text-sm"
													initial={{ opacity: 0, width: 0 }}
													animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }}
													transition={{
														duration: 0.2,
														ease: "easeOut",
													}}
												>
													{name}
												</motion.span>
											)}
										</AnimatePresence>
									</div>
								</TabsTrigger>
							</Link>
						);
					})}
				</TabsList>
			</Tabs>
		</div>
	);
}
