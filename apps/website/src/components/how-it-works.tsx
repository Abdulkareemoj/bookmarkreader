import { motion, useInView } from "motion/react";
import { useRef } from "react";

const steps = [
	{
		num: "01",
		chip: "Local-first",
		chipColor: "text-emerald-400 bg-emerald-400/10",
		title: "Save to your device first",
		desc: "All bookmarks and feeds are stored locally in SQLite. Everything works offline — no account required to get started.",
		mockup: (
			<div className="w-[88%] rounded-t-md border border-white/10 border-b-0 bg-[#0a0a0a] p-3">
				<div className="mb-2 flex items-center gap-2">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
					<div className="h-1.5 w-24 rounded bg-white/10" />
				</div>
				<div className="space-y-1.5">
					<div className="h-1.5 w-full rounded bg-white/10" />
					<div className="h-1.5 w-4/5 rounded bg-white/10" />
					<div className="h-1.5 w-2/5 rounded bg-rose-500/30" />
				</div>
			</div>
		),
	},
	{
		num: "02",
		chip: "Auto-metadata",
		chipColor: "text-amber-400 bg-amber-400/10",
		title: "Metadata fetched automatically",
		desc: "Paste a URL and BookmarkReader fetches the title, description, favicon, and preview image — no manual editing needed.",
		mockup: (
			<div className="flex w-[88%] items-center gap-3 rounded-t-md border border-white/10 border-b-0 bg-[#0a0a0a] p-3">
				<div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-lg">
					🔖
				</div>
				<div className="flex-1 space-y-1.5">
					<div className="h-2 w-4/5 rounded bg-rose-500/30" />
					<div className="h-1.5 w-full rounded bg-white/10" />
					<div className="h-1.5 w-3/5 rounded bg-white/10" />
				</div>
			</div>
		),
	},
	{
		num: "03",
		chip: "Sync everywhere",
		chipColor: "text-sky-400 bg-sky-400/10",
		title: "Your data, your choice",
		desc: "Sync across desktop, web, and mobile when you choose. Your data is never sold. Cloud sync is optional and always encrypted.",
		mockup: (
			<div className="flex w-[88%] items-center justify-between rounded-t-md border border-white/10 border-b-0 bg-[#0a0a0a] p-4">
				<span className="text-xl">🪟</span>
				<div className="flex flex-col items-center gap-1">
					<div className="h-px w-8 bg-rose-500/40" />
					<span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
						sync
					</span>
					<div className="h-px w-8 bg-rose-500/40" />
				</div>
				<span className="text-xl">📱</span>
			</div>
		),
	},
];

export function HowItWorks() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, amount: 0.2 });

	return (
		<section
			id="how"
			className="border-white/[0.06] border-t bg-[#0f0f0f] py-24"
		>
			<div className="mx-auto max-w-5xl px-6">
				{/* Header */}
				<motion.div
					ref={ref}
					className="mb-14 text-center"
					initial={{ opacity: 0, y: 24 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
				>
					<span className="mb-3 block font-mono text-[10px] text-rose-400 uppercase tracking-[0.12em]">
						How it works
					</span>
					<h2 className="font-semibold text-3xl text-white/90 tracking-tight sm:text-4xl">
						A new way to manage your reading.
					</h2>
					<p className="mx-auto mt-4 max-w-md text-sm text-white/35 leading-relaxed">
						Save to your device first, sync in the background. Offline-ready
						from day one.
					</p>
				</motion.div>

				{/* Cards */}
				<div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-3">
					{steps.map((s, i) => (
						<motion.div
							key={s.num}
							className="group flex flex-col overflow-hidden bg-[#141414] transition-colors hover:bg-[#191919]"
							initial={{ opacity: 0, y: 20 }}
							animate={inView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
						>
							<div className="flex flex-1 flex-col p-7 pb-4">
								<span className="mb-4 font-mono text-[10px] text-white/20 uppercase tracking-widest">
									{s.num}
								</span>
								<span
									className={`mb-3 inline-block w-fit rounded-full px-2.5 py-1 font-medium text-[11px] ${s.chipColor}`}
								>
									{s.chip}
								</span>
								<h3 className="mb-2 font-medium text-[15px] text-white/85 leading-snug">
									{s.title}
								</h3>
								<p className="text-[13px] text-white/35 leading-relaxed">
									{s.desc}
								</p>
							</div>
							{/* Bottom mockup */}
							<div className="mt-4 flex justify-center overflow-hidden px-0 transition-transform duration-300 group-hover:translate-y-[-4px]">
								{s.mockup}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
