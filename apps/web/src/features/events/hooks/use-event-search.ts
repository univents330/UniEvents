"use client";

import type { Event } from "@voltaze/schema";
import { useCallback, useMemo } from "react";
import { useEvents } from "./use-events";

export interface SearchSuggestion extends Event {
	matchedFields?: string[];
}

export function useEventSearch(query: string) {
	const { data } = useEvents({
		limit: 50,
		page: 1,
		sortBy: "startDate",
		sortOrder: "asc",
	});

	const events = data?.data || [];

	const suggestions = useMemo(() => {
		if (!query.trim()) {
			return [];
		}

		const queryLower = query.toLowerCase();
		const keywords = queryLower.split(/\s+/).filter(Boolean);

		const scored = events
			.map((event) => {
				const nameTokens = event.name.toLowerCase().split(/\s+/);
				const venueTokens = event.venueName.toLowerCase().split(/\s+/);
				const addressTokens = event.address?.toLowerCase().split(/\s+/) || [];
				const allTokens = [...nameTokens, ...venueTokens, ...addressTokens];

				let matchScore = 0;
				const matchedFields: Set<string> = new Set();

				for (const keyword of keywords) {
					for (const token of allTokens) {
						if (token.includes(keyword) || keyword === token) {
							matchScore += 1;
							if (nameTokens.some((t) => t.includes(keyword))) {
								matchedFields.add("name");
							}
							if (venueTokens.some((t) => t.includes(keyword))) {
								matchedFields.add("venue");
							}
							if (addressTokens.some((t) => t.includes(keyword))) {
								matchedFields.add("address");
							}
						}
					}
				}

				return {
					event,
					matchScore,
					matchedFields: Array.from(matchedFields),
				};
			})
			.filter((item) => item.matchScore > 0)
			.sort((a, b) => b.matchScore - a.matchScore)
			.slice(0, 8);

		return scored.map((item) => ({
			...item.event,
			matchedFields: item.matchedFields,
		}));
	}, [query, events]);

	return { suggestions, isLoading: !data };
}
