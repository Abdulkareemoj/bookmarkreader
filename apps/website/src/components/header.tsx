import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import React from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { Portal, PortalBackdrop } from "./ui/portal";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const scrolled = useScroll(40);
  const [open, setOpen] = React.useState(false);
  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full transition-all duration-300",
        scrolled && "border-b border-border bg-background/80 backdrop-blur-lg",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link className="flex items-center gap-2 text-sm text-ink-secondary hover:text-foreground transition-colors" to="/">
          <Logo className="h-3.5" />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.label} variant="ghost" size="sm" asChild>
              <Link to={link.href}>{link.label}</Link>
            </Button>
          ))}
          <div className="ml-2 h-5 w-px bg-border" />
          <Button variant="secondary" size="sm" asChild>
            <Link to="/download">Download</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Button
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            size="icon"
            variant="ghost"
          >
            {open ? <XIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
          </Button>
          {open && (
            <Portal className="top-14" id="mobile-menu">
              <PortalBackdrop />
              <div className="size-full p-4">
                <div className="grid gap-y-2">
                  {navLinks.map((link) => (
                    <Button asChild key={link.label} variant="ghost" className="justify-start">
                      <Link to={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-2">
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
