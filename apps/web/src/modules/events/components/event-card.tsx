"use client";

import type { EventRecord } from "@unievent/schema";
import dayjs from "dayjs";
import { ArrowRight, CalendarDays, Heart, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/core/lib/cn";

export function EventCard({ event }: { event: EventRecord }) {
	const isOnline = event.mode === "ONLINE";
	const isFree = event.type === "FREE";

	return (
		<Link href={`/events/${event.id}`} className="group block h-full">
			<article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
				{/* Image Section with Glass Badges */}
				<div className="relative aspect-[4/3] w-full overflow-hidden">
					<Image
						src={event.coverUrl || "/assets/welcome.png"}
						alt={event.name}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
					/>

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

					{/* Top Badges */}
					<div className="absolute top-4 left-4 flex flex-wrap gap-2">
						<div
							className={cn(
								"rounded-xl border border-white/10 px-3 py-1.5 shadow-sm backdrop-blur-md",
								isOnline
									? "bg-blue-600/80 text-white"
									: "bg-emerald-600/80 text-white",
							)}
						>
							<span className="font-black text-[10px] uppercase tracking-wider">
								{event.mode}
							</span>
						</div>
					</div>

					{/* Quick Actions (Floating) */}
					<div className="absolute top-4 right-4 flex translate-x-12 flex-col gap-2 transition-transform duration-500 group-hover:translate-x-0">
						<button
							type="button"
							className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-lg backdrop-blur-md transition-colors hover:text-red-500"
						>
							<Heart size={18} />
						</button>
						<button
							type="button"
							className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-lg backdrop-blur-md transition-colors hover:text-blue-600"
						>
							<Share2 size={18} />
						</button>
					</div>

					{/* Price Badge */}
					<div className="absolute bottom-4 left-4">
						<div className="rounded-2xl bg-white px-4 py-2 shadow-xl">
							<span className="font-black text-[#000031] text-sm">
								{isFree ? "FREE" : "Get Tickets"}
							</span>
						</div>
					</div>
				</div>

				{/* Content Body */}
				<div className="flex flex-1 flex-col p-8">
					<div className="mb-3 flex items-center gap-2 font-black text-[11px] text-blue-600 uppercase tracking-[0.15em]">
						<CalendarDays size={14} />
						<span>{dayjs(event.startDate).format("MMM DD, YYYY • HH:mm")}</span>
					</div>

					<h3 className="mb-3 line-clamp-2 font-black text-[#000031] text-xl leading-tight transition-colors group-hover:text-blue-600">
						{event.name}
					</h3>

					<div className="mb-6 flex items-center gap-2 font-bold text-slate-500 text-sm">
						<MapPin size={16} className="text-slate-300" />
						<span className="truncate">{event.venueName}</span>
					</div>

					{/* Meta Info */}
					<div className="mt-auto flex items-center justify-between border-slate-50 border-t pt-6">
						<div className="flex items-center -space-x-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100"
								>
									<div className="h-full w-full bg-slate-200" />
								</div>
							))}
							<div className="pl-4 font-bold text-[11px] text-slate-400">
								+42 attending
							</div>
						</div>

						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
							<ArrowRight size={18} />
						</div>
					</div>
				</div>
			</article>
		</Link>
	);
}
