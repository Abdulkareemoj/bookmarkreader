import { createFileRoute } from "@tanstack/react-router";
import { FAQSection } from "@/components/faq-section";
import Features from "@/components/features";
import Hero from "@/components/hero";
import { NewReleasePromo } from "@/components/new-release-promo";
import { TestimonialsSection } from "@/components/testimonials";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
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

			{/* Hero Section */}
			<Hero />

			{/* Features Section */}
			<div id="features">
				<Features />
			</div>

			{/* Testimonials Section */}
			<div id="testimonials">
				<TestimonialsSection />
			</div>

			<NewReleasePromo />

			{/* FAQ Section */}
			<div id="faq">
				<FAQSection />
			</div>
		</main>
	);
}
