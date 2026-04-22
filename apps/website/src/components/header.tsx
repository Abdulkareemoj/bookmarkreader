"use client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button, buttonVariants } from '@/components/ui/button';
import React from "react";
import { Portal, PortalBackdrop } from "./ui/portal";
import { MenuIcon, XIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";


export const navLinks = [
	{
		label: "Features",
		href: "#",
	},
	{
		label: "Pricing",
		href: "#",
	},
	{
		label: "About",
		href: "#",
	},
];

export default function Header() {
	const scrolled = useScroll(10);
const [open, setOpen] = React.useState(false);
	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-5xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
				{
					"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-4xl md:shadow":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<Link
					className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
					to="/"
				>
					<Logo className="h-4" />
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					<div>
						{navLinks.map((link) => (
							<Button asChild key={link.label} size="sm" variant="ghost">
								<Link to={link.href}>{link.label}</Link>
							</Button>
						))}
					</div>
	    <Button asChild>
      <Link to="/download">Download</Link>
    </Button>
				</div>
				<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<XIcon className="size-4.5" />
				) : (
					<MenuIcon className="size-4.5" />
				)}
			</Button>
			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop />
					<div
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<Button
									asChild
									className="justify-start"
									key={link.label}
									variant="ghost"
								>
									<a href={link.href}>{link.label}</a>
								</Button>
							))}
						</div>
						<div className="mt-12 flex flex-col gap-2">
							    <Button asChild>
      <Link to="/download">Download</Link>
    </Button>
						</div>
					</div>
				</Portal>
			)}
		</div>
			</nav>
		</header>
	);
}
