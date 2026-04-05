import { EventHero } from "@/features/events/components/event-hero";
import { EventCategories } from "@/features/events/components/event-categories";
import { EventsNearYou } from "@/features/events/components/events-near-you";
import { HowItWorks } from "@/features/events/components/how-it-works";
import { TicketDelivery } from "@/features/events/components/ticket-delivery";
import { GroupBooking } from "@/features/events/components/group-booking";
import { FinalCTA } from "@/features/events/components/final-cta";
import { Footer } from "@/shared/ui/footer";

export default function HomePage() {
	return (
		<main>
			<EventHero />
			<EventCategories />
			<EventsNearYou />
			<HowItWorks />
			<TicketDelivery />
			<GroupBooking />
			<FinalCTA />
			<Footer />
		</main>
	);
}
