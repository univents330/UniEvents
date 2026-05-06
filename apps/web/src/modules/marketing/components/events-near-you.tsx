"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/core/lib/cn";
import { EventCard } from "@/modules/events/components/event-card";
import { useEvents } from "@/modules/events/hooks/use-events";
import type { EventListQuery } from "@/modules/events/services/events.service";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import { Button } from "@/shared/ui/button";

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
		const filters: EventListQuery = {
			page: 1,
			limit: 8,
			sortBy: "startDate" as const,
			sortOrder: "asc" as const,
			status: "PUBLISHED" as const,
			isApproved: true,
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
		<section className="w-full bg-[#EBF3FF] py-20">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-10 text-center md:text-left">
					<h2 className="mb-3 font-extrabold text-3xl text-black tracking-tight md:text-5xl">
						Events Happening <span className="text-[#030370]">Near You</span>
					</h2>
					<p className="font-semibold text-base text-slate-500 md:text-lg">
						Smart picks for your vibe, location, and budget.
					</p>
				</div>

				<div className="mb-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2">
					{FILTERS.map((filter) => (
						<Button
							key={filter.id}
							variant={activeFilter === filter.id ? "default" : "outline"}
							className={cn(
								"h-9 rounded-full px-4 font-semibold text-sm transition-all",
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
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
							{[...Array(8)].map((_, i) => (
								<div
									key={i}
									className="h-64 animate-pulse rounded-2xl bg-slate-200"
								/>
							))}
						</div>
					) : events.length > 0 ? (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
								{events.map((event) => (
									<EventCard key={event.id} event={event} />
								))}
							</div>
							<div className="mt-10 flex justify-center">
								<Button
									asChild
									className="rounded-full bg-[#030370] px-8 font-bold text-white hover:bg-[#030370]/90"
								>
									<Link href="/events">
										Explore More Events
										<ArrowRight size={16} className="ml-2" />
									</Link>
								</Button>
							</div>
						</>
					) : (
						<div className="rounded-4xl bg-white py-20 text-center shadow-sm">
							<p className="font-bold text-lg text-slate-400">
								No events found for this filter.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
