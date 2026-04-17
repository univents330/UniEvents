"use client";

import type { EventFilterInput } from "@voltaze/schema";
import { useEvents } from "../../hooks/use-events";
import { EventCarousel } from "../event-carousel/event-carousel";

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
	const filters: EventFilterInput = {
		page: 1,
		limit: 50,
		sortBy: "startDate",
		sortOrder: "asc",
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
		return <EventCarousel events={[]} isLoading={true} />;
	}

	if (events.length === 0) {
		return <EventCarousel events={[]} isLoading={false} />;
	}

	return <EventCarousel events={events} isLoading={false} />;
}
