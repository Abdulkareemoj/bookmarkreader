import { X } from "lucide-react";
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
	const variantStyles = {
		default: "bg-muted text-foreground hover:bg-muted/80",
		primary: "bg-primary/10 text-primary hover:bg-primary/20",
		secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
	};

	return (
		<div
			onClick={onClick}
			className={cn(
				"inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 font-medium text-sm transition-colors",
				variantStyles[variant],
			)}
		>
			<span>{label}</span>
			{removable && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove?.();
					}}
					className="ml-1 transition-opacity hover:opacity-70"
				>
					<X className="h-3 w-3" />
				</button>
			)}
		</div>
	);
}
