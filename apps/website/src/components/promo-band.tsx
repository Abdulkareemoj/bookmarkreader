import { Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "./ui/button";

export function PromoBand() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, amount: 0.3 });

	return (
		<section className="border-white/[0.06] border-t bg-[#0a0a0a] py-24">
			<motion.div
				ref={ref}
				className="mx-auto max-w-xl px-6 text-center"
				initial={{ opacity: 0, y: 24 }}
				animate={inView ? { opacity: 1, y: 0 } : {}}
				transition={{ duration: 0.6 }}
			>
				<span className="mb-4 block font-mono text-[10px] text-rose-400 uppercase tracking-[0.12em]">
					Organize. Read. Sync.
				</span>
				<h2 className="font-semibold text-3xl text-white/90 tracking-tight sm:text-4xl">
					Your digital library,
					<br />
					reimagined.
				</h2>
				<p className="mx-auto mt-4 mb-8 max-w-sm text-sm text-white/35 leading-relaxed">
					Available now on the web. Desktop and mobile apps shipping soon.
				</p>
				<Link to="/download">
					<Button className="h-10 rounded-lg bg-rose-600 px-6 font-medium text-sm text-white shadow-lg shadow-rose-900/30 transition-all hover:-translate-y-0.5 hover:bg-rose-500">
						Get BookmarkReader →
					</Button>
				</Link>
			</motion.div>
		</section>
	);
}
