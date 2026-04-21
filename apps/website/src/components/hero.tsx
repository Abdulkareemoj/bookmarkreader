import { Link } from "@tanstack/react-router";
import { MoveRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function Hero() {
	return (
		<section
			id="hero-section"
			className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#080808] px-6 py-32 text-center"
		>
			{/* Radial glow */}
			<div className="pointer-events-none absolute top-[35%] left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/6" />
			{/* Top beam */}
			<div className="absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-linear-to-r from-transparent via-rose-500/40 to-transparent" />

			{/* Badge */}
			<motion.div
				className="mb-8 flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
				<span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">
					Early access · Phase 1
				</span>
			</motion.div>

			{/* Headline */}
			<motion.h1
				className="max-w-3xl bg-linear-to-b from-white via-white/90 to-white/50 bg-clip-text font-semibold text-5xl text-transparent leading-[1.05] tracking-[-0.04em] sm:text-6xl xl:text-7xl"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, delay: 0.1 }}
			>
				Your bookmarks.
				<br />
				Your feeds.
				<br />
				<span className="text-rose-400">All in one place.</span>
			</motion.h1>

			{/* Subheading */}
			<motion.p
				className="mx-auto mt-6 max-w-md text-[15px] text-white/40 leading-relaxed"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, delay: 0.2 }}
			>
				A local-first bookmark manager and RSS reader that works across desktop,
				web, and mobile — your data always under your control.
			</motion.p>

			{/* CTAs */}
			<motion.div
				className="mt-10 flex flex-wrap justify-center gap-3"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, delay: 0.3 }}
			>
				<Link to="/download">
					<Button className="h-10 rounded-lg bg-rose-600 px-5 font-medium text-sm text-white shadow-lg shadow-rose-900/30 transition-all hover:-translate-y-0.5 hover:bg-rose-500">
						Download — it's free
					</Button>
				</Link>
				<Link to="#how">
					<Button
						variant="secondary"
						className="h-10 rounded-lg border border-white/10 bg-white/5 px-5 text-sm text-white/60 hover:bg-white/10 hover:text-white"
					>
						See how it works <MoveRight className="ml-2 h-3.5 w-3.5" />
					</Button>
				</Link>
			</motion.div>

			{/* Pill tags */}
			<motion.div
				className="mt-12 flex flex-wrap justify-center gap-2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8, delay: 0.5 }}
			>
				{[
					"SQLite · local-first",
					"React + Tauri + Expo",
					"Open source",
					"Desktop · Web · Mobile",
				].map((tag) => (
					<span
						key={tag}
						className="rounded-full border border-white/8 px-3 py-1 font-mono text-[10px] text-white/25 uppercase tracking-widest"
					>
						{tag}
					</span>
				))}
			</motion.div>
		</section>
	);
}
