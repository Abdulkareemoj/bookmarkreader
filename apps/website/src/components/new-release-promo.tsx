export function NewReleasePromo() {
	return (
		<section className="mt-12 w-full">
			<div className="mx-auto max-w-4xl rounded-[40px] border border-black/5 p-2 shadow-sm dark:border-white/20">
				<div className="relative mx-auto h-[400px] max-w-4xl overflow-hidden rounded-[38px] border border-black/5 bg-primary p-2 shadow-sm dark:border-white/20">
					{/* Subtle radial glow from center */}
					<div
						className="absolute inset-0 z-0"
						style={{
							background:
								"radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 64, 23, 0.1), transparent 70%)",
						}}
					/>

					{/* Film grain overlay */}
					<div
						className="absolute inset-0 z-0 opacity-[0.02]"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
						}}
					/>

					<div className="relative z-10">
						<div className="mt-8 text-center">
							<h2 className="mb-6 font-bold text-4xl text-white">
								Organize. Read. Sync.
							</h2>
							<p className="mb-8 text-white/60">
								Your digital library, reimagined.
							</p>
							<div className="flex items-center justify-center">
								<a href="/download">
									<div className="group mt-10 flex h-[64px] cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/70 p-[11px]">
										<div className="flex h-[43px] items-center justify-center rounded-full border border-border bg-primary">
											<p className="mr-3 ml-2 flex items-center justify-center gap-2 font-medium text-white tracking-tight">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="lucide lucide-bookmark animate-pulse"
													aria-hidden="true"
												>
													<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
												</svg>
												Try BookmarkReader
											</p>
										</div>
										<div className="flex size-[26px] items-center justify-center rounded-full border-2 border-border transition-all ease-in-out group-hover:ml-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="lucide lucide-arrow-right transition-all ease-in-out group-hover:rotate-45"
												aria-hidden="true"
											>
												<path d="M5 12h14" />
												<path d="m12 5 7 7-7 7" />
											</svg>
										</div>
									</div>
								</a>
							</div>
						</div>

						{/* Stroked text wordmark */}
						<h1
							className="pointer-events-none absolute inset-x-0 mt-[120px] text-center font-semibold text-[100px] text-transparent sm:mt-[30px] sm:text-[190px]"
							style={{
								WebkitTextStroke: "1px currentColor",
								color: "transparent",
							}}
							aria-hidden="true"
						>
							BookmarkReader
						</h1>
						<h1
							className="pointer-events-none absolute inset-x-0 mt-[120px] text-center font-semibold text-[100px] text-primary sm:mt-[30px] sm:text-[190px]"
							aria-hidden="true"
						>
							BookmarkReader
						</h1>
					</div>
				</div>
			</div>
		</section>
	);
}
