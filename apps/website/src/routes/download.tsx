import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
// import { SiteFooter } from "@/components/site-footer";
// import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
	component: Download,
});

const platforms = [
	{
		icon: "🌐",
		name: "Web app",
		version: "v0.1",
		desc: "Use BookmarkReader in any modern browser — no installation needed.",
		status: "available" as const,
		href: "/web",
	},
	{
		icon: "🪟",
		name: "Windows",
		desc: "Native app for Windows 10 and later, built with Tauri.",
		status: "soon" as const,
	},
	{
		icon: "🍎",
		name: "macOS",
		desc: "Universal binary — Intel and Apple Silicon.",
		status: "soon" as const,
	},
	{
		icon: "🐧",
		name: "Linux",
		desc: "AppImage and .deb packages for Ubuntu and derivatives.",
		status: "soon" as const,
	},
	{
		icon: "📱",
		name: "iOS",
		desc: "iPhone and iPad app, available on the App Store.",
		status: "soon" as const,
	},
	{
		icon: "🤖",
		name: "Android",
		desc: "Available on Google Play Store.",
		status: "soon" as const,
	},
];

const availablePlatforms = platforms.filter((p) => p.status === "available");
const desktopPlatforms = platforms.filter(
	(p) => p.status === "soon" && ["Windows", "macOS", "Linux"].includes(p.name),
);
const mobilePlatforms = platforms.filter(
	(p) => p.status === "soon" && ["iOS", "Android"].includes(p.name),
);

function PlatformCard({
	platform,
	index,
	inView,
}: {
	platform: (typeof platforms)[0];
	index: number;
	inView: boolean;
}) {
	return (
		<motion.div
			className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#141414] px-5 py-4 transition-colors hover:border-white/12"
			initial={{ opacity: 0, y: 12 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.4, delay: 0.05 * index }}
		>
			<span className="w-10 shrink-0 text-center text-2xl">
				{platform.icon}
			</span>
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<span className="font-medium text-[13px] text-white/75">
						{platform.name}
					</span>
					{"version" in platform && platform.version && (
						<span className="rounded border border-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/25">
							{platform.version}
						</span>
					)}
				</div>
				<p className="mt-0.5 text-[12px] text-white/25">{platform.desc}</p>
			</div>
			<div className="shrink-0">
				{platform.status === "available" ? (
					<Link to={platform.href ?? "#"}>
						<Button className="h-8 rounded-lg bg-rose-600 px-4 font-medium text-[12px] text-white hover:bg-rose-500">
							Open app →
						</Button>
					</Link>
				) : (
					<span className="rounded-lg border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] text-white/20 tracking-wider">
						Soon
					</span>
				)}
			</div>
		</motion.div>
	);
}

function Download() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, amount: 0.1 });

	return (
		<main className="relative min-h-screen w-full bg-[#080808]">
			{/* <SiteNav /> */}

			{/* Hero */}
			<section className="px-6 pt-32 pb-12 text-center">
				<div className="mx-auto max-w-lg">
					<motion.span
						className="mb-4 block font-mono text-[10px] text-rose-400 uppercase tracking-[0.12em]"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Download
					</motion.span>
					<motion.h1
						className="mb-4 font-semibold text-3xl text-white/90 tracking-tight sm:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						Get BookmarkReader
					</motion.h1>
					<motion.p
						className="text-[14px] text-white/35 leading-relaxed"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
					>
						Currently in early Phase 1. The web app is live and ready to use.
						Native desktop and mobile apps are in active development.
					</motion.p>
				</div>
			</section>

			{/* Platform list */}
			<div ref={ref} className="mx-auto max-w-xl px-6 pb-24">
				{/* Available */}
				<div className="mb-4 flex items-center gap-3">
					<span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
						Available now
					</span>
					<div className="flex-1 border-white/[0.07] border-t" />
				</div>
				<div className="mb-8 space-y-2">
					{availablePlatforms.map((p, i) => (
						<PlatformCard key={p.name} platform={p} index={i} inView={inView} />
					))}
				</div>

				{/* Desktop */}
				<div className="mb-4 flex items-center gap-3">
					<span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
						Desktop — coming soon
					</span>
					<div className="flex-1 border-white/[0.07] border-t" />
				</div>
				<div className="mb-8 space-y-2">
					{desktopPlatforms.map((p, i) => (
						<PlatformCard
							key={p.name}
							platform={p}
							index={i + 1}
							inView={inView}
						/>
					))}
				</div>

				{/* Mobile */}
				<div className="mb-4 flex items-center gap-3">
					<span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
						Mobile — coming soon
					</span>
					<div className="flex-1 border-white/[0.07] border-t" />
				</div>
				<div className="mb-10 space-y-2">
					{mobilePlatforms.map((p, i) => (
						<PlatformCard
							key={p.name}
							platform={p}
							index={i + 4}
							inView={inView}
						/>
					))}
				</div>

				{/* Email notify */}
				<motion.div
					className="rounded-xl border border-white/[0.07] bg-[#141414] p-5"
					initial={{ opacity: 0, y: 16 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, delay: 0.35 }}
				>
					<div className="flex gap-3">
						<span className="mt-0.5 text-base">📧</span>
						<div className="flex-1">
							<p className="mb-1 font-medium text-[13px] text-white/70">
								Get notified when desktop apps launch
							</p>
							<p className="mb-4 text-[12px] text-white/25">
								One email when each platform ships. No newsletters.
							</p>
							<div className="flex flex-wrap gap-2">
								<input
									type="email"
									placeholder="your@email.com"
									className="h-9 min-w-0 flex-1 rounded-lg border border-white/8 bg-white/5 px-3 font-mono text-[12px] text-white/60 placeholder-white/20 outline-none focus:border-rose-500/40 focus:ring-0"
								/>
								<Button className="h-9 rounded-lg bg-rose-600 px-4 font-medium text-[12px] text-white hover:bg-rose-500">
									Notify me
								</Button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* <SiteFooter /> */}
		</main>
	);
}
