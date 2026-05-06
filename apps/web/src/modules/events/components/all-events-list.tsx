"use client";

import { useEvents } from "@/modules/events";
import { EventCard } from "@/modules/events/components/event-card";
import { EventCardSkeleton } from "@/modules/events/components/event-card-skeleton";

interface AllEventsListProps {
	searchParams: {
		search?: string;
		location?: string;
		category?: string;
		mode?: string;
		type?: string;
	};
}

const CATEGORY_SEARCH_MAP: Record<string, string> = {
	"tech-dev": "tech",
	music: "music",
	"college-fests": "fest",
	workshops: "workshop",
	"art-culture": "comedy",
	meetups: "meetup",
};

export function AllEventsList({ searchParams }: AllEventsListProps) {
	const filters: Record<string, string | number | boolean> = {
		page: 1,
		limit: 50,
		sortBy: "startDate",
		sortOrder: "asc",
		status: "PUBLISHED",
		isApproved: true,
	};

	if (searchParams.search) {
		filters.search = searchParams.search;
	}

	if (searchParams.location) {
		const normalizedLocation = searchParams.location.trim().toLowerCase();

		if (normalizedLocation === "online") {
			filters.mode = "ONLINE";
		} else {
			filters.search = filters.search
				? `${filters.search} ${searchParams.location}`
				: searchParams.location;
		}
	}

	if (searchParams.category) {
		const categoryStr =
			CATEGORY_SEARCH_MAP[searchParams.category] ||
			searchParams.category.toLowerCase().replace("-", " ");
		filters.search = filters.search
			? `${filters.search} ${categoryStr}`
			: categoryStr;
	}

	if (searchParams.mode === "ONLINE" || searchParams.mode === "OFFLINE") {
		filters.mode = searchParams.mode;
	}

	if (searchParams.type === "FREE" || searchParams.type === "PAID") {
		filters.type = searchParams.type;
	}

	const { data, isLoading } = useEvents(filters);
	const events = data?.data || [];

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
				{[...Array(6)].map((_, i) => (
					<EventCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-12">
				<p className="text-slate-400 italic">
					No events found matching your criteria.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
			{events.map((event) => (
				<EventCard key={event.id} event={event} className="h-full" />
			))}
		</div>
	);
}
