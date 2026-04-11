import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Header() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const scrollToElement = (elementId: string) => {
		const element = document.getElementById(elementId);
		if (element) {
			const headerOffset = 120; // Account for sticky header height + margin
			const elementPosition =
				element.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = elementPosition - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		} else if (location.pathname !== "/") {
			navigate(`/#${elementId}`);
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (location.hash) {
			const elementId = location.hash.replace("#", "");
			setTimeout(() => {
				scrollToElement(elementId);
			}, 100);
		}
	}, [location]);

	const handleNavClick = (e: React.MouseEvent, elementId: string) => {
		e.preventDefault();
		scrollToElement(elementId);
	};

	const handleMobileNavClick = (elementId: string) => {
		setIsMobileMenuOpen(false);
		setTimeout(() => {
			scrollToElement(elementId);
		}, 100);
	};

	return (
		<>
			{/* Desktop Header */}
			<header
				className={`sticky top-4 z-9999 mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-sm transition-all duration-300 md:flex ${
					isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
				} py-2`}
				style={{
					willChange: "transform",
					transform: "translateZ(0)",
					backfaceVisibility: "hidden",
					perspective: "1000px",
				}}
			>
				<Link
					className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
						isScrolled ? "ml-4" : ""
					}`}
					to="/"
				>
					<img
						src="/rose.webp"
						alt="BookmarkReader Logo"
						className="size-8 w-8 rounded-full text-foreground"
						width={32}
						height={32}
					/>
					<span className="font-bold text-foreground">BookmarkReader</span>
				</Link>

				<div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 font-medium text-muted-foreground text-sm transition duration-200 hover:text-foreground md:flex md:space-x-2">
					<Link
						to=""
						className="relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
						onClick={(e) => handleNavClick(e, "features")}
					>
						<span className="relative z-20">Features</span>
					</Link>
					<Link
						to="/download"
						className="relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
					>
						<span className="relative z-20">Download</span>
					</Link>
					<Link
						to=""
						className="relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
						onClick={(e) => handleNavClick(e, "testimonials")}
					>
						<span className="relative z-20">Testimonials</span>
					</Link>
					<Link
						to=""
						className="relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
						onClick={(e) => handleNavClick(e, "faq")}
					>
						<span className="relative z-20">FAQ</span>
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<Link
						to="/download"
						className="relative inline-block cursor-pointer rounded-md bg-gradient-to-b from-primary to-primary/80 px-4 py-2 text-center font-bold text-primary-foreground text-sm shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5"
					>
						Download Now
					</Link>
				</div>
			</header>

			{/* Mobile Header */}
			<header className="sticky top-4 z-9999 mx-4 flex w-auto flex-row items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
				<Link className="flex items-center justify-center gap-2" to="/">
					<img
						src="/rose.webp"
						alt="BookmarkReader Logo"
						className="size-7 w-7 rounded-full text-foreground"
						width={28}
						height={28}
					/>
				</Link>

				<Button
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/50 transition-colors hover:bg-background/80"
					aria-label="Toggle menu"
				>
					<div className="flex h-5 w-5 flex-col items-center justify-center space-y-1">
						<span
							className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`}
						/>
						<span
							className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
						/>
						<span
							className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
						/>
					</div>
				</Button>
			</header>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
					<div className="absolute top-20 right-4 left-4 rounded-2xl border border-border/50 bg-background/95 p-6 shadow-2xl backdrop-blur-md">
						<nav className="flex flex-col space-y-4">
							<Button
								onClick={() => handleMobileNavClick("features")}
								className="rounded-lg px-4 py-3 text-left font-medium text-lg text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
							>
								Features
							</Button>
							<Link
								to="/download"
								onClick={() => setIsMobileMenuOpen(false)}
								className="rounded-lg px-4 py-3 text-left font-medium text-lg text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
							>
								Download
							</Link>
							<Button
								onClick={() => handleMobileNavClick("testimonials")}
								className="rounded-lg px-4 py-3 text-left font-medium text-lg text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
							>
								Testimonials
							</Button>
							<Button
								onClick={() => handleMobileNavClick("faq")}
								className="rounded-lg px-4 py-3 text-left font-medium text-lg text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
							>
								FAQ
							</Button>
							<div className="mt-4 flex flex-col space-y-3 border-border/50 border-t pt-4">
								<Link
									to="/download"
									onClick={() => setIsMobileMenuOpen(false)}
									className="rounded-lg bg-gradient-to-b from-primary to-primary/80 px-4 py-3 text-center font-bold text-lg text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5"
								>
									Download Now
								</Link>
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
