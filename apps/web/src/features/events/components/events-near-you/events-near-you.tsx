"use client";

import type { EventFilterInput } from "@voltaze/schema";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import { cn } from "@/shared/lib/utils";
import { useEvents } from "../../hooks/use-events";
import { EventCarousel } from "../event-carousel/event-carousel";

const FILTERS = [
	{ id: "all", label: "All Events" },
	{ id: "nearby", label: "Near Me" },
	{ id: "online", label: "Online" },
	{ id: "offline", label: "Offline" },
	{ id: "free", label: "Free" },
	{ id: "paid", label: "Paid" },
];

export function EventsNearYou() {
	const [activeFilter, setActiveFilter] = useState("all");
	const { location } = useLiveLocation({ fallback: "", autoDetect: true });

	// Prepare filters for API
	const getApiFilters = () => {
		const filters: EventFilterInput = {
			page: 1,
			limit: 8,
			sortBy: "startDate",
			sortOrder: "asc",
		};

		if (activeFilter === "free") filters.type = "FREE";
		if (activeFilter === "paid") filters.type = "PAID";
		if (activeFilter === "online") filters.mode = "ONLINE";
		if (activeFilter === "offline") filters.mode = "OFFLINE";

		if (activeFilter === "nearby" && location) {
			filters.search = location;
		}

		return filters;
	};

	const { data, isLoading } = useEvents(getApiFilters());
	const events = (data?.data || []).slice(0, 8);
	const nearLabel = location ? `Near ${location}` : "Near Me";

	return (
		<section className="w-full bg-[#EBF3FF] py-12 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
				<div className="mb-8 text-center md:text-left lg:mb-10">
					<h2 className="mb-3 font-extrabold text-2xl text-black tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
						Events Happening <span className="text-[#030370]">Near You</span>
					</h2>
					<p className="font-semibold text-slate-500 text-sm sm:text-base md:text-lg">
						Smart picks for your vibe, location, and budget.
					</p>
				</div>

				<div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 lg:mb-10">
					{FILTERS.map((filter) => (
						<Button
							key={filter.id}
							variant={activeFilter === filter.id ? "default" : "outline"}
							className={cn(
								"h-8 rounded-full px-3 font-semibold text-xs transition-all sm:h-9 sm:px-4 sm:text-sm",
								activeFilter === filter.id
									? "border-[#030370] bg-[#030370] text-white hover:bg-[#030370]/90"
									: "border-slate-200 bg-white text-slate-600 hover:border-[#030370] hover:text-[#030370]",
							)}
							onClick={() => setActiveFilter(filter.id)}
						>
							{filter.id === "nearby" ? nearLabel : filter.label}
						</Button>
					))}
				</div>

				<div>
					{isLoading ? (
						<EventCarousel events={[]} isLoading={true} />
					) : events.length > 0 ? (
						<>
							<EventCarousel events={events} isLoading={false} />
							<div className="mt-8 flex justify-center sm:mt-10">
								<Button
									asChild
									className="h-12 rounded-full bg-[#030370] px-6 font-bold text-white hover:bg-[#030370]/90 sm:h-14 sm:px-8"
								>
									<Link href="/events">
										Explore More Events
										<ArrowRight size={16} className="ml-2" />
									</Link>
								</Button>
							</div>
						</>
					) : (
						<div className="rounded-4xl bg-white py-16 text-center shadow-sm sm:py-20">
							<p className="font-bold text-base text-slate-400 sm:text-lg">
								No events found for this filter.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
