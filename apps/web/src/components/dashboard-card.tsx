import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function PopNumber({ value }: { value: number }) {
	const str = String(value);
	return (
		<span className="t-digit-group is-animating" key={value}>
			{str.split("").map((ch, i) => (
				<span
					key={i}
					className="t-digit"
					data-stagger={
						i === str.length - 2 ? "1" : i === str.length - 1 ? "2" : undefined
					}
				>
					{ch}
				</span>
			))}
		</span>
	);
}

interface DashboardCardProps {
	title: string;
	value: number;
	icon: LucideIcon;
	to: string;
	colorClass: string;
}

export function DashboardCard({
	title,
	value,
	icon: Icon,
	to,
	colorClass,
}: DashboardCardProps) {
	return (
		<Link to={to as any} className="block h-full">
			<Card className="h-full transition-shadow hover:shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="font-medium text-sm">{title}</CardTitle>
					<Icon className={cn("text-muted-foreground", colorClass)} />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl">
						<PopNumber value={value} />
					</div>
					<p className="text-muted-foreground text-xs">View all</p>
				</CardContent>
			</Card>
		</Link>
	);
}
