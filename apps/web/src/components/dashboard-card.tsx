import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-muted-foreground text-xs">View all</p>
        </CardContent>
      </Card>
    </Link>
  );
}
