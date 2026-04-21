import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ─── Shared skeleton helper ─── */
function Sk({
	w = "100%",
	h = 7,
	accent = false,
}: {
	w?: string;
	h?: number;
	accent?: boolean;
}) {
	return (
		<div
			style={{ width: w, height: h }}
			className={`rounded ${accent ? "bg-rose-500/25" : "bg-white/[0.07]"} mb-1.5`}
		/>
	);
}

/* ─── Mockup: Bookmark Manager ─── */
function BookmarkMockup() {
	const items = [
		{ emoji: "📰", tag: "News", w1: "75%", w2: "55%" },
		{ emoji: "🛠", tag: "Dev", w1: "62%", w2: "42%" },
		{ emoji: "🎨", tag: "Design", w1: "80%", w2: "65%" },
		{ emoji: "📚", tag: "Books", w1: "55%", w2: "45%" },
		{ emoji: "🎬", tag: "Video", w1: "70%", w2: "50%" },
	];
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#141414]">
			{/* Window chrome */}
			<div className="flex h-9 flex-shrink-0 items-center gap-1.5 border-white/[0.07] border-b bg-[#101010] px-3">
				<div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
				<div className="h-2 w-2 rounded-full bg-[#febc2e]" />
				<div className="h-2 w-2 rounded-full bg-[#28c840]" />
				<div className="ml-2 h-5 flex-1 rounded border border-white/[0.05] bg-white/[0.05]" />
			</div>
			<div className="flex flex-col gap-2 p-4">
				<div className="mb-2 flex items-center">
					<span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
						All bookmarks
					</span>
					<div className="ml-auto h-5 w-14 rounded bg-rose-600/70" />
				</div>
				{items.map((item) => (
					<div
						key={item.emoji}
						className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-[#0f0f0f] px-3 py-2"
					>
						<span className="text-sm">{item.emoji}</span>
						<div className="flex-1">
							<Sk w={item.w1} h={7} accent />
							<Sk w={item.w2} h={6} />
						</div>
						<span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[9px] text-rose-400">
							{item.tag}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Mockup: RSS Reader ─── */
function RssMockup() {
	const feeds = ["The Verge", "Hacker News", "CSS-Tricks", "Smashing Mag"];
	const articles = [
		{
			title: "The future of local-first software",
			time: "2h ago",
			unread: true,
		},
		{
			title: "How RSS changed how I read the web",
			time: "5h ago",
			unread: true,
		},
		{ title: "Building with Tauri in 2025", time: "1d ago", unread: false },
		{
			title: "Offline-first patterns explained",
			time: "2d ago",
			unread: false,
		},
	];
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#141414]">
			<div className="flex h-9 flex-shrink-0 items-center gap-1.5 border-white/[0.07] border-b bg-[#101010] px-3">
				<div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
				<div className="h-2 w-2 rounded-full bg-[#febc2e]" />
				<div className="h-2 w-2 rounded-full bg-[#28c840]" />
				<span className="ml-2 font-mono text-[10px] text-white/20 tracking-wider">
					RSS Feeds
				</span>
			</div>
			<div className="flex">
				{/* Sidebar */}
				<div className="w-36 flex-shrink-0 border-white/[0.07] border-r p-3">
					<p className="mb-2 font-mono text-[9px] text-white/20 uppercase tracking-widest">
						Subscribed
					</p>
					{feeds.map((f, i) => (
						<div
							key={f}
							className={`flex items-center gap-1.5 rounded px-2 py-1 ${i === 1 ? "bg-white/[0.07]" : ""}`}
						>
							<div
								className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-rose-400" : "bg-white/15"}`}
							/>
							<span
								className={`text-[10px] ${i === 1 ? "text-white/70" : "text-white/25"}`}
							>
								{f}
							</span>
						</div>
					))}
				</div>
				{/* Articles */}
				<div className="flex-1 p-3">
					{articles.map((a) => (
						<div
							key={a.title}
							className="mb-2.5 border-white/[0.06] border-b pt-0 pb-2.5 last:mb-0 last:border-0"
						>
							<p
								className={`mb-1 text-[11px] leading-snug ${a.unread ? "font-medium text-white/75" : "text-white/30"}`}
							>
								{a.title}
							</p>
							<span className="font-mono text-[9px] text-white/20">
								{a.time}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Mockup: Collections ─── */
function CollectionsMockup() {
	const folders = [
		{ name: "Research", count: 48, active: true },
		{ name: "Frontend", count: 22, active: false },
		{ name: "Design", count: 31, active: false },
		{ name: "Tools", count: 15, active: false },
		{ name: "Reading", count: 67, active: false },
	];
	const tags = ["CSS", "React", "Performance", "TypeScript", "WASM"];
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#141414]">
			<div className="flex h-9 flex-shrink-0 items-center gap-1.5 border-white/[0.07] border-b bg-[#101010] px-3">
				<div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
				<div className="h-2 w-2 rounded-full bg-[#febc2e]" />
				<div className="h-2 w-2 rounded-full bg-[#28c840]" />
				<span className="ml-2 font-mono text-[10px] text-white/20 tracking-wider">
					Collections
				</span>
			</div>
			<div className="flex">
				<div className="w-36 flex-shrink-0 border-white/[0.07] border-r p-3">
					<p className="mb-2 font-mono text-[9px] text-white/20 uppercase tracking-widest">
						Workspace
					</p>
					{folders.map((f) => (
						<div
							key={f.name}
							className={`flex items-center gap-1.5 rounded px-2 py-1 ${f.active ? "bg-white/[0.07]" : ""}`}
						>
							<span className="text-[11px]">📁</span>
							<span
								className={`flex-1 text-[10px] ${f.active ? "text-white/70" : "text-white/25"}`}
							>
								{f.name}
							</span>
							<span className="font-mono text-[9px] text-white/20">
								{f.count}
							</span>
						</div>
					))}
				</div>
				<div className="flex-1 p-3">
					<div className="mb-3 flex flex-wrap gap-1">
						{tags.map((t, i) => (
							<span
								key={t}
								className={`rounded-full border px-2 py-0.5 text-[9px] ${i === 0 ? "border-rose-400/40 text-rose-400" : "border-white/10 text-white/25"}`}
							>
								{t}
							</span>
						))}
					</div>
					{[0, 1, 2, 3].map((i) => (
						<div
							key={i}
							className="mb-2 rounded-md border border-white/[0.06] bg-[#0f0f0f] p-2"
						>
							<Sk w="80%" h={7} accent />
							<Sk w="55%" h={6} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Mockup: Cross-platform ─── */
function PlatformMockup() {
	const platforms = ["Windows", "macOS", "Linux", "iOS", "Android", "Web"];
	return (
		<div className="flex items-center justify-center rounded-xl border border-white/[0.09] bg-[#141414] p-8">
			<div className="text-center">
				<div className="mb-6 flex items-center justify-center gap-5">
					{/* Desktop */}
					<div className="flex w-20 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0f0f0f]">
						<div className="flex items-center gap-1 border-white/[0.07] border-b bg-[#0a0a0a] px-1.5 py-1">
							<div className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
							<div className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
							<div className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
						</div>
						<div className="space-y-1 p-2">
							<Sk w="100%" h={5} />
							<Sk w="70%" h={5} accent />
							<Sk w="85%" h={5} />
						</div>
					</div>
					{/* Sync arrow */}
					<div className="flex flex-col items-center gap-1.5">
						<div className="h-px w-10 bg-rose-500/30" />
						<div className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-xs">
							🔖
						</div>
						<div className="h-px w-10 bg-rose-500/30" />
					</div>
					{/* Mobile */}
					<div className="flex w-12 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0f0f0f]">
						<div className="h-3 border-white/[0.07] border-b bg-[#0a0a0a]" />
						<div className="space-y-1 p-1.5">
							<Sk w="100%" h={4} />
							<Sk w="70%" h={4} accent />
							<Sk w="85%" h={4} />
							<Sk w="60%" h={4} />
						</div>
						<div className="h-1.5 bg-[#0a0a0a]" />
					</div>
				</div>
				<p className="mb-4 text-[12px] text-white/30 leading-relaxed">
					Your library, everywhere.
					<br />
					Always in sync.
				</p>
				<div className="flex flex-wrap justify-center gap-1.5">
					{platforms.map((p) => (
						<span
							key={p}
							className="rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] text-white/25 tracking-wide"
						>
							{p}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Feature row data ─── */
const featureRows = [
	{
		icon: "🔖",
		title: "Bookmark Manager",
		desc: "Save any URL and get a beautiful library with auto-fetched titles, descriptions, favicons, and previews. Find anything instantly with full-text search and tags.",
		points: [
			"Auto-fetched metadata on save",
			"Collections, tags, and smart filters",
			"Import from Chrome, Firefox, Safari",
			"Full-text search across all bookmarks",
		],
		mockup: <BookmarkMockup />,
		reverse: false,
	},
	{
		icon: "📡",
		title: "RSS Reader",
		desc: "Subscribe to any RSS or Atom feed. Articles are fetched automatically, stored locally, and always readable offline — even with no connection.",
		points: [
			"Subscribe to any RSS or Atom feed",
			"Read/unread tracking per article",
			"Full offline reading support",
			"Folder-based feed organization",
		],
		mockup: <RssMockup />,
		reverse: true,
	},
	{
		icon: "🗂",
		title: "Collections & Tags",
		desc: "Organize hundreds of bookmarks with a flexible tagging and collection system. Filter, sort, and surface exactly what you need without digging.",
		points: [
			"Nested collections and sub-folders",
			"Multi-tag filtering with AND/OR logic",
			"Smart collections by domain or date",
			"Drag-and-drop organization",
		],
		mockup: <CollectionsMockup />,
		reverse: false,
	},
	{
		icon: "🔄",
		title: "Cross-Platform Sync",
		desc: "Start saving on desktop, pick up where you left off on mobile. Optional encrypted sync keeps every device in perfect lockstep without compromising privacy.",
		points: [
			"Desktop: Windows, macOS, Linux via Tauri",
			"Mobile: iOS and Android via Expo",
			"Web app available right now",
			"End-to-end encrypted optional sync",
		],
		mockup: <PlatformMockup />,
		reverse: true,
	},
];

function FeatureRow({
	icon,
	title,
	desc,
	points,
	mockup,
	reverse,
	index,
}: (typeof featureRows)[0] & { index: number }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, amount: 0.2 });

	return (
		<div
			ref={ref}
			className="grid grid-cols-1 items-center gap-12 border-white/[0.06] border-t py-20 md:grid-cols-2 md:gap-16"
		>
			<motion.div
				className={reverse ? "md:order-2" : ""}
				initial={{ opacity: 0, x: reverse ? 24 : -24 }}
				animate={inView ? { opacity: 1, x: 0 } : {}}
				transition={{ duration: 0.6, delay: index * 0.05 }}
			>
				<div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-lg">
					{icon}
				</div>
				<h3 className="mb-3 font-semibold text-2xl text-white/90 tracking-tight">
					{title}
				</h3>
				<p className="mb-6 text-sm text-white/40 leading-relaxed">{desc}</p>
				<ul className="space-y-2.5">
					{points.map((p) => (
						<li
							key={p}
							className="flex items-start gap-2.5 text-sm text-white/40"
						>
							<span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400" />
							{p}
						</li>
					))}
				</ul>
			</motion.div>

			<motion.div
				className={reverse ? "md:order-1" : ""}
				initial={{ opacity: 0, x: reverse ? -24 : 24 }}
				animate={inView ? { opacity: 1, x: 0 } : {}}
				transition={{ duration: 0.6, delay: index * 0.05 + 0.1 }}
			>
				{mockup}
			</motion.div>
		</div>
	);
}

export function FeaturesSection() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, amount: 0.1 });

	return (
		<section id="features" className="bg-[#080808] py-4">
			<div className="mx-auto max-w-5xl px-6">
				{/* Header */}
				<motion.div
					ref={ref}
					className="pt-20 pb-4 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
				>
					<span className="mb-3 block font-mono text-[10px] text-rose-400 uppercase tracking-[0.12em]">
						Features
					</span>
					<h2 className="font-semibold text-3xl text-white/90 tracking-tight sm:text-4xl">
						Everything in one tool.
					</h2>
					<p className="mx-auto mt-3 max-w-md text-sm text-white/35">
						Get multiple products in one. Use only what you need.
					</p>
				</motion.div>

				{/* Rows */}
				{featureRows.map((row, i) => (
					<FeatureRow key={row.title} {...row} index={i} />
				))}
			</div>
		</section>
	);
}
