"use client";

import type { Event } from "@voltaze/schema";
import { ArrowRight, Calendar, Heart, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFavoriteEvents } from "../../hooks";

export interface EventCardProps {
	event: Event;
	className?: string;
}

export function EventCard({ event, className = "" }: EventCardProps) {
	const { isFavorite, toggleFavorite } = useFavoriteEvents();
	const saved = isFavorite(event.id);
	const [isCoverLoading, setIsCoverLoading] = useState(true);

	const coverImage =
		event.coverUrl ||
		"https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80";

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getTag = (name: string) => {
		const lower = name.toLowerCase();
		if (
			lower.includes("tech") ||
			lower.includes("workshop") ||
			lower.includes("code")
		) {
			return "Tech";
		}
		if (lower.includes("music") || lower.includes("concert")) {
			return "Music";
		}
		if (
			lower.includes("art") ||
			lower.includes("culture") ||
			lower.includes("fest")
		) {
			return "Cultural";
		}
		return "Meetup";
	};

	return (
		<Card
			className={`group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
		>
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					toggleFavorite(event.id);
				}}
				className="absolute top-3 right-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-600 shadow-sm transition-colors hover:text-rose-500"
				aria-label={saved ? "Remove from saved" : "Save event"}
			>
				<Heart
					size={14}
					className={saved ? "fill-rose-500 text-rose-500" : ""}
				/>
			</button>

			<Link
				href={{ pathname: `/events/${event.slug}` }}
				className="block h-full"
			>
				<div className="relative aspect-16/8 w-full overflow-hidden bg-slate-100">
					<Image
						src={coverImage}
						alt={event.name}
						fill
						sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
						className={`scale-[0.98] object-cover transition-opacity duration-300 group-hover:scale-[1.02] ${
							isCoverLoading ? "opacity-0" : "opacity-100"
						}`}
						onLoad={() => setIsCoverLoading(false)}
						onError={() => setIsCoverLoading(false)}
					/>
					{isCoverLoading ? (
						<div className="absolute inset-0 bg-slate-200/80" />
					) : null}
					{event.type === "FREE" && (
						<Badge className="absolute top-3 left-3 rounded-full bg-emerald-500 px-2.5 py-0.5 font-bold text-[10px] text-white hover:bg-emerald-600">
							Free
						</Badge>
					)}
					<Badge
						variant="secondary"
						className="absolute bottom-3 left-3 rounded-full border-none bg-white/90 px-3 py-1 font-bold text-[10px] text-black shadow-sm"
					>
						{getTag(event.name)}
					</Badge>
				</div>

				<CardContent className="flex flex-col p-3">
					<h3 className="mb-1 line-clamp-2 min-h-10 font-bold text-[17px] text-black leading-snug transition-colors group-hover:text-[#030370]">
						{event.name}
					</h3>
					<p className="mb-2 line-clamp-1 font-medium text-[14px] text-slate-500">
						{event.address}
					</p>

					<div className="mb-2 grid grid-cols-1 gap-1">
						<div className="flex items-center gap-1.5 font-semibold text-[12px] text-slate-500">
							<Calendar size={12} className="text-slate-400" />
							<span>{formatDate(event.startDate)}</span>
						</div>
						<div className="flex items-center gap-1.5 font-semibold text-[12px] text-slate-500">
							<MapPin size={12} className="text-slate-400" />
							<span className="line-clamp-1">{event.venueName}</span>
						</div>
						<div className="flex items-center gap-1.5 font-semibold text-[12px] text-slate-500">
							<Users size={12} className="text-slate-400" />
							<span>
								{event.mode === "ONLINE" ? "Online event" : "In-person event"}
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between border-slate-100 border-t pt-2">
						<div className="font-extrabold text-[14px] text-black">
							{event.type === "FREE" ? "Free" : "Paid"}
						</div>
						<div className="inline-flex items-center font-bold text-[#030370] text-xs">
							View Event <ArrowRight size={12} className="ml-1" />
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}
