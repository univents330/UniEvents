"use client";

import type { EventRecord } from "@unievent/schema";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

export interface EventCardProps {
	event: EventRecord;
	className?: string;
}

export function EventCard({ event, className = "" }: EventCardProps) {
	const [isCoverLoading, setIsCoverLoading] = useState(true);

	const coverImage =
		event.coverUrl ||
		"https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80";

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return {
			day: d.getDate(),
			month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
			full: d.toLocaleDateString("en-US", {
				weekday: "short",
				hour: "numeric",
				minute: "2-digit",
			}),
		};
	};

	const date = formatDate(event.startDate);

	return (
		<Card
			className={`group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-2 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 ${className}`}
		>
			<Link href={{ pathname: `/events/${event.id}` }} className="block h-full">
				<div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-slate-100">
					<Image
						src={coverImage}
						alt={event.name}
						fill
						sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
						className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
							isCoverLoading ? "opacity-0" : "opacity-100"
						}`}
						onLoad={() => setIsCoverLoading(false)}
						onError={() => setIsCoverLoading(false)}
					/>

					{/* Date Badge */}
					<div className="absolute top-4 left-4 flex flex-col items-center rounded-2xl bg-white/90 px-3 py-2 text-[#030370] shadow-xl backdrop-blur-md">
						<span className="font-black text-[10px] tracking-tighter">
							{date.month}
						</span>
						<span className="font-black text-xl leading-none">{date.day}</span>
					</div>

					{/* Type/Mode Overlays */}
					<div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
						<Badge className="rounded-full border-none bg-[#030370]/80 px-3 py-1 font-black text-[9px] text-white backdrop-blur-md">
							{event.mode}
						</Badge>
						<Badge className="rounded-full border-none bg-white/90 px-3 py-1 font-black text-[#030370] text-[9px] backdrop-blur-md">
							{event.type === "FREE" ? "FREE ACCESS" : "PAID EVENT"}
						</Badge>
					</div>
				</div>

				<CardContent className="flex flex-col px-4 pt-6 pb-4">
					<div className="mb-4 flex items-center gap-2">
						<div className="h-1 w-1 rounded-full bg-blue-600" />
						<span className="font-black text-[9px] text-blue-600 uppercase tracking-[0.2em]">
							{event.venueName || "Location TBD"}
						</span>
					</div>

					<h3 className="mb-3 line-clamp-2 min-h-[3rem] font-black text-slate-900 text-xl leading-[1.2] tracking-tight transition-colors group-hover:text-blue-600">
						{event.name}
					</h3>

					<p className="mb-6 line-clamp-1 font-bold text-slate-400 text-xs">
						{date.full} • {event.address || "Main Campus Hub"}
					</p>

					<div className="flex items-center justify-between border-slate-50 border-t pt-4">
						<div className="flex items-center gap-2">
							<div className="flex -space-x-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100"
									>
										<Image
											src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + event.id}`}
											alt="avatar"
											width={24}
											height={24}
										/>
									</div>
								))}
							</div>
							<span className="font-bold text-[10px] text-slate-400">
								+12 Going
							</span>
						</div>

						<div className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all group-hover:rotate-[-45deg] group-hover:bg-[#030370] group-hover:text-white">
							<ArrowRight size={16} strokeWidth={3} />
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}
