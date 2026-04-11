import { createFileRoute } from "@tanstack/react-router";
import { DownloadHero } from "@/components/download-hero";
import { PlatformCards } from "@/components/platform-cards";

export const Route = createFileRoute("/download")({
	component: Download,
});

function Download() {
	return (
		<main className="relative min-h-screen w-full bg-black">
			{/* Pearl Mist Background with Top Glow */}
			<div
				className="absolute inset-0 z-0"
				style={{
					background:
						"radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
				}}
			/>

			<DownloadHero />
			<PlatformCards />
		</main>
	);
}
