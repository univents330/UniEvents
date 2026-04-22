"use client";

import type { EventRecord } from "@unievent/schema";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/core/lib/cn";
import { EventCard } from "@/modules/events/components/event-card";
import { Button } from "@/shared/ui/button";

const FILTERS = [
	{ id: "all", label: "All Events" },
	{ id: "nearby", label: "Near Me" },
	{ id: "online", label: "Online" },
	{ id: "offline", label: "Offline" },
	{ id: "free", label: "Free" },
	{ id: "paid", label: "Paid" },
];

const MOCK_EVENTS = [
	{
		id: "evt_1",
		name: "Web3 Developers Meetup",
		description:
			"A community gathering for web3 developers, designers, and enthusiasts to discuss the latest trends in decentralized tech.",
		startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
		venueName: "Innovation Hub, Block C",
		mode: "OFFLINE",
		type: "FREE",
		visibility: "PUBLIC",
		coverUrl:
			"https://images.unsplash.com/photo-1591115765373-520b7a21769b?q=80&w=2070&auto=format&fit=crop",
		thumbnail:
			"https://images.unsplash.com/photo-1591115765373-520b7a21769b?q=80&w=200&auto=format&fit=crop",
	},
	{
		id: "evt_2",
		name: "React Advanced Masterclass",
		description:
			"Deep dive into React Server Components, Actions, and the future of the frontend ecosystem with hands-on labs.",
		startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
		venueName: "Online (Zoom)",
		mode: "ONLINE",
		type: "PAID",
		visibility: "PUBLIC",
		coverUrl:
			"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
		thumbnail:
			"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop",
	},
	{
		id: "evt_3",
		name: "University Startup Pitch",
		description:
			"Watch the top 10 university startups pitch their ideas to leading angel investors and venture capitalists.",
		startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
		venueName: "Main Auditorium",
		mode: "OFFLINE",
		type: "FREE",
		visibility: "PUBLIC",
		coverUrl:
			"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop",
		thumbnail:
			"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=200&auto=format&fit=crop",
	},
	{
		id: "evt_4",
		name: "Design Systems Workshop",
		description:
			"Learn how to build and scale design systems using Tailwind CSS and Radix UI in this intensive workshop.",
		startDate: new Date(Date.now() + 86400000 * 15).toISOString(),
		venueName: "Design Studio 4",
		mode: "OFFLINE",
		type: "PAID",
		visibility: "PUBLIC",
		coverUrl:
			"https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2070&auto=format&fit=crop",
		thumbnail:
			"https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=200&auto=format&fit=crop",
	},
] as EventRecord[];

export function EventsNearYou() {
	const [activeFilter, setActiveFilter] = useState("all");

	return (
		<section className="w-full bg-transparent py-24">
			<div className="mx-auto max-w-[1440px] px-6">
				<div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
					<div className="text-center md:text-left">
						<h2 className="mb-4 font-black text-4xl text-slate-900 tracking-tighter md:text-6xl">
							Events Happening <span className="text-blue-700">Near You</span>
						</h2>
						<p className="font-bold text-slate-400 md:text-xl">
							Handpicked experiences just for you.
						</p>
					</div>
					<Button
						asChild
						variant="ghost"
						className="hidden h-12 rounded-full border-slate-200 px-8 font-black md:flex"
					>
						<Link href="/discover">Explore all</Link>
					</Button>
				</div>

				<div className="mb-12 flex flex-wrap justify-center gap-3 md:justify-start">
					{FILTERS.map((filter) => (
						<button
							type="button"
							key={filter.id}
							onClick={() => setActiveFilter(filter.id)}
							className={`rounded-full px-6 py-2 font-black text-sm transition-all ${
								activeFilter === filter.id
									? "bg-slate-900 text-white"
									: "bg-slate-100 text-slate-700 hover:bg-slate-200"
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>

				<div>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{MOCK_EVENTS.map((event) => (
							<EventCard key={event.id} event={event} />
						))}
					</div>

					<div className="mt-16 flex justify-center">
						<button
							type="button"
							className="h-14 rounded-full bg-slate-900 px-10 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
						>
							Explore More Events
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
