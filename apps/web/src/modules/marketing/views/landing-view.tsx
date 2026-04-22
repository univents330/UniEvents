"use client";

import { CTA } from "../components/cta";
import { EventCategories } from "../components/event-categories";
import { EventsNearYou } from "../components/events-near-you";
import { FeaturesBento } from "../components/features-bento";
import { Hero } from "../components/hero";
import { HowItWorks } from "../components/how-it-works";

export function LandingView() {
	return (
		<div className="w-full space-y-4">
			<Hero />
			<EventCategories />
			<EventsNearYou />
			<HowItWorks />
			<FeaturesBento />
			<CTA />
		</div>
	);
}
