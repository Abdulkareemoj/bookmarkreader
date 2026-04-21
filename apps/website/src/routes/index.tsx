import { createFileRoute } from "@tanstack/react-router";
import { FAQSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features";
import Hero from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { PromoBand } from "@/components/promo-band";

import { TestimonialsSection } from "@/components/testimonials";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<main>
			{/* Hero */}
			<Hero />

			{/* How it works */}
			<HowItWorks />

			{/* Features — alternating rows with mockups */}
			<FeaturesSection />

			{/* Testimonials */}
			<TestimonialsSection />

			{/* Promo CTA band */}
			<PromoBand />

			{/* FAQ */}
			<FAQSection />
		</main>
	);
}
