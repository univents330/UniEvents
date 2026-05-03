"use client";

import { EventCategories } from "../components/event-categories";
import { EventHero } from "../components/event-hero";
import { EventsNearYou } from "../components/events-near-you";
import { FinalCTA } from "../components/final-cta";
import { GroupBooking } from "../components/group-booking";
import { HowItWorks } from "../components/how-it-works";
import { TicketDelivery } from "../components/ticket-delivery";

export function LandingView() {
	return (
		<div>
			<EventHero />
			<main>
				<EventCategories />
				<EventsNearYou />
				<HowItWorks />
				<TicketDelivery />
				<GroupBooking />
				<FinalCTA />
			</main>
		</div>
	);
}
