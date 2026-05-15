import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagPillProps {
	label: string;
	variant?: "default" | "primary" | "secondary";
	removable?: boolean;
	onRemove?: () => void;
	onClick?: () => void;
}

export default function TagPill({
	label,
	variant = "default",
	removable = false,
	onRemove,
	onClick,
}: TagPillProps) {
	const badgeVariant =
		variant === "primary"
			? "outline"
			: variant === "secondary"
				? "secondary"
				: "default";
	const customClass =
		variant === "primary"
			? "bg-primary/10 text-primary hover:bg-primary/20"
			: "";

	return (
		<Badge
			onClick={onClick}
			variant={badgeVariant}
			className={cn(
				"cursor-pointer px-3 py-1 font-medium text-sm",
				customClass,
			)}
		>
			<span>{label}</span>
			{removable && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						onRemove?.();
					}}
					className="ml-1 size-4 transition-opacity hover:opacity-70"
				>
					<X data-icon="inline-start" className="size-3" />
				</Button>
			)}
		</Badge>
	);
}
