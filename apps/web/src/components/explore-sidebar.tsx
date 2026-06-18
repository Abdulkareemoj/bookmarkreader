import { Link } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Activity, TrendingUp, Sparkles, Bookmark, Film, Shuffle, List } from "lucide-react";

const exploreItems = [
	{
		name: "Overview",
		url: "/explore#overview",
		icon: Activity,
	},
	{
		name: "Trending",
		url: "/explore#trending",
		icon: TrendingUp,
	},
	{
		name: "Recommended",
		url: "/explore#recommended",
		icon: Sparkles,
	},
	{
		name: "Backlog",
		url: "/explore#backlog",
		icon: Bookmark,
	},
	{
		name: "YouTube",
		url: "/explore#youtube",
		icon: Film,
	},
	{
		name: "Surprise",
		url: "/explore#surprise",
		icon: Shuffle,
	},
	{
		name: "Directory",
		url: "/explore#directory",
		icon: List,
	},
];
 
export function ExploreSidebar(){
 
	return (
		
		<SidebarGroup>
			<SidebarMenu>
				{exploreItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<Link to={item.url}>
								{<item.icon className="size-5" />}
								<span className="font-semibold">{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);

}