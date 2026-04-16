import { useTheme } from "next-themes";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Sun, Cloud, Info } from "lucide-react";
 
const settingsItems = [
	{
		name: "Theme",
		url: "/settings#theme",
		icon: Sun,
	},
	{
		name: "Sync",
		url: "/settings#sync",
		icon: Cloud,
	},
	{
		name: "About",
		url: "/settings#about",
		icon: Info,
	},
];
 

 
 
export function SettingsSidebar(){
 
	return (
		
		<SidebarGroup>
			<SidebarMenu>
				{settingsItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<Link to={item.url}>
								
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);

}