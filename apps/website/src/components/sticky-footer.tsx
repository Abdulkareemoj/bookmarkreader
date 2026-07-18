import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const footerLinks = {
  Product: [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#" },
    { label: "Download", href: "/download" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ],
};

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="pb-80">
      <AnimatePresence>
        {isAtBottom && (
          <motion.div
            className="fixed bottom-0 left-0 z-50 flex h-80 w-full items-center bg-card"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="relative mx-auto flex h-full w-full max-w-6xl items-start justify-between px-6 py-12">
              <div className="flex gap-16">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h4 className="mb-4 font-mono text-[10px] text-ink-tertiary uppercase tracking-widest">
                      {category}
                    </h4>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.href}
                            className="text-sm text-ink-secondary transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-end justify-between">
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-foreground tracking-tight">
                    ReadrSync
                  </p>
                  <p className="mt-1 text-xs text-ink-tertiary">
                    &copy; {new Date().getFullYear()} All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
