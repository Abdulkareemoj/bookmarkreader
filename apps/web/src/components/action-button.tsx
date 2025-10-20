;

import { Button } from "@workspace/ui/components/button";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
	icon: LucideIcon;
	label: string;
	variant?: "default" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	active?: boolean;
	onClick?: () => void;
	className?: string;
}

export default function ActionButton({
	icon: Icon,
	label,
	variant = "outline",
	size = "md",
	active = false,
	onClick,
	className,
}: ActionButtonProps) {
	const sizeStyles = {
		sm: "h-8 px-2 text-xs gap-1",
		md: "h-10 px-3 text-sm gap-2",
		lg: "h-12 px-4 text-base gap-2",
	};

	return (
		<Button
			variant={variant}
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 bg-transparent",
				active && "bg-primary/10 text-primary",
				sizeStyles[size],
				className,
			)}
		>
			<Icon className={cn("h-4 w-4", size === "lg" && "h-5 w-5")} />
			<span>{label}</span>
		</Button>
	);
}
