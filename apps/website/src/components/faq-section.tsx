import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function FAQSection() {
	const [openItems, setOpenItems] = useState<number[]>([]);

	const toggleItem = (index: number) => {
		setOpenItems((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
		);
	};

	const faqs = [
		{
			question: "What is BookmarkReader?",
			answer:
				"BookmarkReader is a cross-platform bookmark and RSS manager that helps you organize your digital life. It works on desktop (Windows, macOS, Linux), web, and mobile devices, with local-first storage and optional cloud sync coming soon.",
		},
		{
			question: "Is my data private and secure?",
			answer:
				"Yes! BookmarkReader is local-first, meaning your data is stored on your device using SQLite (desktop/web) or AsyncStorage (mobile). We're working on optional cloud sync, but your data will always remain under your control.",
		},
		{
			question: "What platforms are supported?",
			answer:
				"Currently, the web version is available for testing. Desktop apps (Windows, macOS, Linux) and mobile apps (iOS, Android) are in development and coming soon. All platforms will have consistent features and sync capabilities.",
		},
		{
			question: "Can I import my existing bookmarks?",
			answer:
				"Yes! BookmarkReader supports importing bookmarks from browsers like Chrome, Firefox, and Safari. You can also import from other bookmark managers using standard formats like HTML bookmarks or JSON.",
		},
		{
			question: "How does the RSS reader work?",
			answer:
				"Subscribe to any RSS feed and BookmarkReader will automatically fetch and parse articles. You can read articles offline, track read/unread states, and get notifications for new content. The reader supports text and basic HTML content.",
		},
		{
			question: "Is BookmarkReader open source?",
			answer:
				"Yes! BookmarkReader is built with open-source technologies (React, TypeScript, Tauri, Expo) and the code is available on GitHub. We welcome contributions from the community.",
		},
		{
			question: "What's the pricing model?",
			answer:
				"BookmarkReader will be free to use with optional premium features for advanced functionality like cloud sync, team collaboration, and AI-powered features. We believe in keeping core bookmark management accessible to everyone.",
		},
	];

	return (
		<section id="faq" className="relative overflow-hidden pt-24 pb-120">
			{/* Background blur effects */}
			<div className="absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />
			<div className="absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />

			<div className="container z-10 mx-auto px-4">
				<motion.div
					className="flex justify-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-primary uppercase">
						<span>✶</span>
						<span className="text-sm">Faqs</span>
					</div>
				</motion.div>

				<motion.h2
					className="mx-auto mt-6 max-w-xl text-center font-medium text-4xl md:text-[54px] md:leading-[60px]"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true }}
				>
					Questions? We've got{" "}
					<span className="bg-gradient-to-b from-foreground via-rose-200 to-primary bg-clip-text text-transparent">
						answers
					</span>
				</motion.h2>

				<div className="mx-auto mt-12 flex max-w-xl flex-col gap-6">
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-secondary/40 to-secondary/10 p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:border-white/20"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => toggleItem(index)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									toggleItem(index);
								}
							}}
							{...(index === faqs.length - 1 && { "data-faq": faq.question })}
						>
							<div className="flex items-start justify-between">
								<h3 className="m-0 pr-4 font-medium">{faq.question}</h3>
								<motion.div
									animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
									transition={{ duration: 0.3, ease: "easeInOut" }}
									className=""
								>
									{openItems.includes(index) ? (
										<Minus
											className="flex-shrink-0 text-primary transition duration-300"
											size={24}
										/>
									) : (
										<Plus
											className="flex-shrink-0 text-primary transition duration-300"
											size={24}
										/>
									)}
								</motion.div>
							</div>
							<AnimatePresence>
								{openItems.includes(index) && (
									<motion.div
										className="mt-4 overflow-hidden text-muted-foreground leading-relaxed"
										initial={{ opacity: 0, height: 0, marginTop: 0 }}
										animate={{ opacity: 1, height: "auto", marginTop: 16 }}
										exit={{ opacity: 0, height: 0, marginTop: 0 }}
										transition={{
											duration: 0.4,
											ease: "easeInOut",
											opacity: { duration: 0.2 },
										}}
									>
										{faq.answer}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
