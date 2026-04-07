"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchSuggestion } from "@/features/events/hooks/use-event-search";
import { startTopLoader } from "@/shared/lib/top-loader-events";

export interface SearchSuggestionsProps {
	suggestions: SearchSuggestion[];
	isOpen: boolean;
	isLoading?: boolean;
	onSuggestionSelect?: () => void;
}

export function SearchSuggestions({
	suggestions,
	isOpen,
	isLoading = false,
	onSuggestionSelect,
}: SearchSuggestionsProps) {
	const router = useRouter();

	const handleSuggestionClick = (eventSlug: string) => {
		startTopLoader();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		router.push(`/events/${eventSlug}` as any);
		onSuggestionSelect?.();
	};

	if (!isOpen) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
				<p className="text-center text-slate-500 text-sm">
					Loading suggestions...
				</p>
			</div>
		);
	}

	if (suggestions.length === 0) {
		return (
			<div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
				<p className="text-center text-slate-500 text-sm">
					No events found. Try different keywords.
				</p>
			</div>
		);
	}

	return (
		<div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
			{suggestions.map((event) => (
				<button
					key={event.id}
					type="button"
					onClick={() => handleSuggestionClick(event.slug)}
					className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#030370]/20"
				>
					<div className="flex items-start gap-2.5">
						<div className="min-w-0 flex-1">
							<h4 className="line-clamp-1 font-semibold text-slate-900 text-sm">
								{event.name}
							</h4>
							<div className="mt-0.5 flex items-center gap-1 text-slate-500 text-xs">
								<MapPin size={12} />
								<span className="line-clamp-1">
									{event.venueName || event.address}
								</span>
							</div>
						</div>
						<div className="ml-2 shrink-0">
							<span className="inline-block rounded-full bg-[#030370]/10 px-2 py-1 font-medium text-[#030370] text-xs">
								{event.type === "FREE" ? "Free" : "Paid"}
							</span>
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
