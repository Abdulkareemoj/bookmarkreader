import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import ThemeToggle from "./theme-toggle";

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
					const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
					setIsAtBottom(isNearBottom);
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
						className="fixed bottom-0 left-0 z-50 flex h-80 w-full items-center justify-center bg-primary"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						<div className="relative flex h-full w-full items-start justify-end overflow-hidden px-6 py-8 text-right sm:px-12 sm:py-12">
							<div className="z-10 flex flex-col items-end justify-end gap-4">
								<motion.div
									className="flex flex-row space-x-8 text-xs sm:space-x-12 sm:text-sm md:space-x-16 md:text-base lg:space-x-24 lg:text-sm"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.1 }}
								>
									<ul className="space-y-2 text-primary-foreground">
										<li className="mb-3 font-semibold text-lg text-primary-foreground/80">
											Product
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/">Home</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/features">Features</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/pricing">Pricing</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/showcase">Showcase</Link>
										</li>
									</ul>
									<ul className="space-y-2 text-primary-foreground">
										<li className="mb-3 font-semibold text-lg text-primary-foreground/80">
											Company
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/about">About</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/blog">Blog</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/contact">Contact</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/changelog">Changelog</Link>
										</li>
									</ul>
									<ul className="space-y-2 text-primary-foreground">
										<li className="mb-3 font-semibold text-lg text-primary-foreground/80">
											Legal
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/terms">Terms</Link>
										</li>
										<li className="cursor-pointer transition-colors hover:text-primary-foreground/90 hover:underline">
											<Link to="/privacy">Privacy</Link>
										</li>
									</ul>
								</motion.div>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.6, delay: 0.2 }}
									className="mt-4"
								>
									<ThemeToggle />
								</motion.div>
								<motion.p
									className="mt-4 text-primary-foreground/60 text-xs"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.6, delay: 0.3 }}
								>
									&copy; {new Date().getFullYear()} BookmarkReader. All rights
									reserved.
								</motion.p>
							</div>
							<motion.h2
								className="pointer-events-none absolute bottom-0 left-0 translate-y-1/3 select-none font-bold text-[60px] text-primary-foreground/10 sm:text-[120px] lg:text-[192px]"
								initial={{ opacity: 0, x: -100 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.3 }}
							>
								BR
							</motion.h2>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</footer>
	);
}
