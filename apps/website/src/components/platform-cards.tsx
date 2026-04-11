"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const platforms = [
	{
		name: "Web",
		description:
			"Use BookmarkReader directly in your browser - no installation needed.",
		icon: "🌐",
		status: "available",
		downloadUrl: "/web",
	},
	{
		name: "Desktop (Windows)",
		description: "Native desktop app for Windows 10 and later.",
		icon: "🪟",
		status: "coming-soon",
		downloadUrl: "#",
	},
	{
		name: "Desktop (macOS)",
		description: "Native desktop app for macOS (Intel and Apple Silicon).",
		icon: "🍎",
		status: "coming-soon",
		downloadUrl: "#",
	},
	{
		name: "Desktop (Linux)",
		description: "Native desktop app for Ubuntu and other Linux distributions.",
		icon: "🐧",
		status: "coming-soon",
		downloadUrl: "#",
	},
	{
		name: "iOS",
		description: "Download from the Apple App Store (coming soon).",
		icon: "📱",
		status: "coming-soon",
		downloadUrl: "#",
	},
	{
		name: "Android",
		description: "Download from Google Play Store (coming soon).",
		icon: "🤖",
		status: "coming-soon",
		downloadUrl: "#",
	},
];

export function PlatformCards() {
	const [hoveredId, setHoveredId] = useState<number | null>(null);

	return (
		<section className="bg-background px-4 py-20 md:px-8">
			<div className="mx-auto max-w-4xl">
				<div className="space-y-4">
					{platforms.map((platform, index) => (
						<Card
							key={index}
							className="cursor-pointer border-border bg-card p-6 transition-all hover:border-accent/50"
							onMouseEnter={() => setHoveredId(index)}
							onMouseLeave={() => setHoveredId(null)}
						>
							<div className="flex items-center justify-between gap-4">
								<div className="flex flex-1 items-center gap-4">
									<div className="text-4xl">{platform.icon}</div>
									<div className="flex-1">
										<h3 className="font-semibold text-foreground text-lg">
											{platform.name}
										</h3>
										<p className="text-muted-foreground text-sm">
											{platform.description}
										</p>
									</div>
								</div>
								<div>
									{platform.status === "available" ? (
										<Button
											className="whitespace-nowrap bg-accent text-accent-foreground hover:bg-accent/90"
											asChild
										>
											<a href={platform.downloadUrl}>Download</a>
										</Button>
									) : (
										<div className="rounded-md bg-muted px-4 py-2 font-medium text-muted-foreground text-sm">
											Coming Soon
										</div>
									)}
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
