import { AllEventsList } from "@/features/events/components/all-events-list/all-events-list";
import { EventsPageFilters } from "@/features/events/components/events-page-filters/events-page-filters";

import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default async function EventsPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string;
		location?: string;
		category?: string;
		mode?: string;
		type?: string;
	}>;
}) {
	const params = await searchParams;
	const mode =
		params.mode ??
		(params.location?.toLowerCase() === "online" ? "ONLINE" : undefined);

	return (
		<div className="min-h-screen bg-[#f8fbff]">
			<Navbar />
			<div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-20">
				<div className="space-y-5">
					<EventsPageFilters
						category={params.category}
						mode={mode}
						type={params.type}
						location={params.location}
					/>

					<AllEventsList searchParams={params} />
				</div>
			</div>
			<Footer />
		</div>
	);
}
