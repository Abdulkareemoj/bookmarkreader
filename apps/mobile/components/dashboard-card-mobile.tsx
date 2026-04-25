import { Link } from "expo-router";
import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface DashboardCardMobileProps {
  title: string;
  value: number;
  icon: LucideIcon;
  to: string;
  colorClass: string;
}

export function DashboardCardMobile({
  title,
  value,
  icon: IconComponent,
  to,
  colorClass,
}: DashboardCardMobileProps) {
  return (
    <Link href={to as any} asChild>
      <Card className="flex-1 active:opacity-70">
        <CardContent>
          <View className="flex-row items-center justify-between pb-2">
            <Text className="text-sm font-medium text-foreground">{title}</Text>
            <Icon
              as={IconComponent}
              className={cn("size-4 text-muted-foreground", colorClass)}
            />
          </View>
          <View className="mt-1">
            <Text className="text-2xl font-bold text-foreground">{value}</Text>
            <Text className="text-muted-foreground text-xs">View all</Text>
          </View>
        </CardContent>
      </Card>
    </Link>
  );
}
