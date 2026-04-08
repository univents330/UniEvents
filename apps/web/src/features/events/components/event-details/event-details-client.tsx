"use client";

import {
	Car,
	Footprints,
	Heart,
	Mail,
	MapPin,
	Share2,
	Train,
	UserCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth";
import { showNotification } from "@/shared/lib/notifications";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";
import { useFavoriteEvents } from "../../hooks";
import { useEvent, useEvents, useTicketTiers } from "../../hooks/use-events";
import { EventCard } from "../event-card/event-card";

export function EventDetailsClient({ slug }: { slug: string }) {
	const router = useRouter();
	const { data: user } = useCurrentUser();
	const { data: event, isLoading } = useEvent(slug);
	const { data: tiersResponse } = useTicketTiers(event?.id ?? "");
	const { isFavorite, toggleFavorite } = useFavoriteEvents();
	const [showStickyBookingBar, setShowStickyBookingBar] = useState(false);
	const ctaAnchorRef = useRef<HTMLDivElement | null>(null);
	const tiers = [...(tiersResponse?.data ?? [])].sort(
		(a, b) => a.price - b.price,
	);
	const paidTier =
		tiers.find((tier) => tier.price > 0 && tier.soldCount < tier.maxQuantity) ??
		null;
	const { data: relatedEventsResponse } = useEvents({
		page: 1,
		limit: 8,
		sortBy: "startDate",
		sortOrder: "asc",
		mode: event?.mode,
		type: event?.type,
		search:
			event?.mode === "ONLINE"
				? "online"
				: event?.address?.split(",")[0]?.trim() || undefined,
	});
	const minPrice = tiers[0]?.price ?? (event?.type === "FREE" ? 0 : null);
	const totalCapacity = tiers.reduce((acc, tier) => acc + tier.maxQuantity, 0);
	const relatedEvents = (relatedEventsResponse?.data ?? [])
		.filter((relatedEvent) => relatedEvent.id !== event?.id)
		.slice(0, 4);

	const scrollToTicketOptions = () => {
		document.getElementById("ticket-options")?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const handleBookNowClick = async () => {
		if (!event) {
			return;
		}

		if (!user) {
			const redirectTo = encodeURIComponent(`/events/${event.slug}/checkout`);
			startTopLoader();
			router.push(`/login?redirect=${redirectTo}`);
			return;
		}

		if (event.type === "FREE") {
			scrollToTicketOptions();
			return;
		}

		if (!paidTier) {
			scrollToTicketOptions();
			showNotification({
				title: "Tickets unavailable",
				message: "No paid ticket tier is currently available for booking.",
				color: "red",
			});
			return;
		}

		startTopLoader();
		router.push(`/events/${event.slug}/checkout`);
	};

	useEffect(() => {
		const target = ctaAnchorRef.current;

		if (!target) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setShowStickyBookingBar(!entry.isIntersecting);
			},
			{
				root: null,
				threshold: 0,
				rootMargin: "-76px 0px 0px 0px",
			},
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col bg-white">
				<Navbar />
				<div className="container mx-auto space-y-12 px-6 pt-24">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
						<div className="space-y-8 lg:col-span-2">
							<Skeleton className="h-100 w-full rounded-3xl" />
							<Skeleton className="h-16 w-3/4" />
							<div className="grid grid-cols-2 gap-4">
								<Skeleton className="h-20 w-full rounded-2xl" />
								<Skeleton className="h-20 w-full rounded-2xl" />
							</div>
						</div>
						<div className="space-y-6">
							<Skeleton className="h-125 w-full rounded-4xl" />
							<Skeleton className="h-24 w-full rounded-2xl" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="flex min-h-screen w-full flex-col bg-white">
				<Navbar />
				<div className="container mx-auto flex flex-1 items-center justify-center px-6 pt-24 text-center">
					<div>
						<h2 className="mb-4 font-extrabold text-4xl text-[#030370]">
							Event not found
						</h2>
						<p className="mb-8 font-medium text-lg text-slate-500">
							The event you are looking for does not exist or has been removed.
						</p>
						<Button
							asChild
							size="lg"
							className="rounded-full bg-[#030370] px-10"
						>
							<a href="/events">Browse all events</a>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return (
			d.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
			}) +
			" " +
			d.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			})
		);
	};

	const formatDayMonth = (date: Date | string) => {
		const d = new Date(date);
		const day = d.getDate();
		const month = d.toLocaleDateString("en-US", { month: "short" });
		const year = d.getFullYear().toString().slice(-2);

		// Add ordinal suffix (st, nd, rd, th)
		const suffix = (day: number) => {
			if (day > 3 && day < 21) return "th";
			switch (day % 10) {
				case 1:
					return "st";
				case 2:
					return "nd";
				case 3:
					return "rd";
				default:
					return "th";
			}
		};

		return `${month} ${day}${suffix(day)}'${year}`;
	};

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(amount / 100);
	};

	return (
		<div className="min-h-screen w-full bg-[#f8fbff]">
			<Navbar />

			{showStickyBookingBar && (
				<div className="sticky top-16 z-40 border-slate-200 border-b bg-white/95 backdrop-blur">
					<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
						<div className="flex min-w-0 items-center gap-3">
							<div
								className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-center bg-cover bg-slate-100"
								style={{
									backgroundImage: `url(${event.coverUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80"})`,
								}}
							/>
							<div className="min-w-0">
								<p className="line-clamp-1 font-bold text-[13px] text-slate-900">
									{event.name}
								</p>
								<p className="line-clamp-1 text-[11px] text-slate-500">
									{formatDayMonth(event.startDate)} • {event.venueName}
								</p>
								<p className="font-semibold text-[#030370] text-[11px]">
									{minPrice === null
										? "Paid event"
										: minPrice === 0
											? "Free event"
											: `From ${formatMoney(minPrice)}`}
								</p>
							</div>
						</div>
						<Button
							className="h-9 rounded-full border border-slate-200 bg-white px-5 text-[#070190] text-xs hover:bg-slate-100"
							onClick={handleBookNowClick}
						>
							Book Now
						</Button>
					</div>
				</div>
			)}

			<div className="container mx-auto max-w-7xl px-6 pt-22 lg:px-10">
				<div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
					{/* LEFT COLUMN: Overview */}
					<div className="space-y-7">
						{/* Main Event Image */}
						<div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/10 shadow-sm">
							<div
								className="absolute inset-0 scale-110 bg-center bg-cover blur-md"
								style={{
									backgroundImage: `url(${event.coverUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"})`,
								}}
							/>
							<div
								className="relative mx-auto aspect-16/8 w-full max-w-5xl bg-center bg-cover"
								role="img"
								aria-label={event.name}
								style={{
									backgroundImage: `url(${event.coverUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"})`,
								}}
							/>
						</div>

						<div>
							<h1 className="mb-4 font-extrabold text-3xl text-black leading-tight tracking-tight md:text-4xl">
								{event.name}
							</h1>
							<div className="mb-6 flex flex-wrap gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => toggleFavorite(event.id)}
									className="rounded-full"
								>
									<Heart
										className={`mr-2 h-4 w-4 ${isFavorite(event.id) ? "fill-rose-500 text-rose-500" : ""}`}
									/>
									{isFavorite(event.id) ? "Saved" : "Save Event"}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="rounded-full"
								>
									<Share2 className="mr-2 h-4 w-4" /> Share Event
								</Button>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-5">
								<h2 className="mb-4 font-bold text-[#030370] text-lg">
									Event Details
								</h2>
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
									<div>
										<p className="font-semibold text-slate-900">Date & Time</p>
										<p className="text-slate-600">
											{formatDate(event.startDate)} -{" "}
											{formatDate(event.endDate)}
										</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Timezone</p>
										<p className="text-slate-600">{event.timezone}</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Location</p>
										<p className="text-slate-600">{event.venueName}</p>
										<p className="text-slate-500">{event.address}</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Event Type</p>
										<p className="text-slate-600">
											{event.mode} • {event.type}
										</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Capacity</p>
										<p className="text-slate-600">
											{totalCapacity > 0
												? `${totalCapacity} seats available`
												: "Flexible capacity"}
										</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Visibility</p>
										<p className="text-slate-600">{event.visibility}</p>
									</div>
									<div>
										<p className="font-semibold text-slate-900">Status</p>
										<p className="text-slate-600">{event.status}</p>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-5">
								<h2 className="mb-3 font-bold text-[#030370] text-lg">
									About This Event
								</h2>
								<p className="whitespace-pre-wrap text-slate-600 text-sm leading-relaxed">
									{event.description}
								</p>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN: Action Sidebar */}
					<div className="space-y-6 lg:sticky lg:top-20">
						{/* Registration Card */}
						<div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
							<div className="mb-8 flex items-start justify-between">
								<div className="flex flex-col">
									<span className="mb-1 font-semibold text-base text-slate-500">
										Registration Fee
									</span>
									<span className="font-extrabold text-3xl text-black">
										{minPrice === null
											? "Paid"
											: minPrice === 0
												? "Free"
												: formatMoney(minPrice)}
									</span>
								</div>
								<div className="flex flex-col items-end">
									<span className="mb-1 font-semibold text-base text-slate-500">
										Date
									</span>
									<span className="font-extrabold text-2xl text-black">
										{formatDayMonth(event.startDate)}
									</span>
								</div>
							</div>

							<div ref={ctaAnchorRef} className="h-1 w-full" />

							<Button
								className="h-13 w-full rounded-2xl bg-[#070190] font-bold text-base text-white shadow-[0_8px_18px_rgba(7,1,144,0.25)] transition-all hover:bg-[#030370]"
								onClick={handleBookNowClick}
							>
								Book Now
							</Button>
							<span className="mt-3 text-center font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
								secure checkout powered by razorpay
							</span>

							<div
								id="ticket-options"
								className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
							>
								<p className="font-bold text-[#030370] text-sm uppercase tracking-wide">
									Ticket Options
								</p>
								{tiers.length > 0 ? (
									tiers.map((tier) => (
										<div
											key={tier.id}
											className="flex items-center justify-between rounded-xl bg-white p-3"
										>
											<div>
												<p className="font-bold text-slate-800 text-sm">
													{tier.name}
												</p>
												<p className="text-slate-500 text-xs">
													{tier.maxQuantity - tier.soldCount} seats left
												</p>
											</div>
											<p className="font-extrabold text-[#030370] text-sm">
												{tier.price === 0 ? "Free" : formatMoney(tier.price)}
											</p>
										</div>
									))
								) : (
									<p className="text-slate-500 text-sm">
										Ticket tiers will be published soon.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<section className="mt-16">
					<h2 className="mb-6 font-extrabold text-2xl text-black tracking-tight md:text-3xl">
						Organizer Info
					</h2>
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
						<div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
							<div className="rounded-2xl bg-blue-50 p-5">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
									<UserCircle2 className="h-7 w-7 text-blue-700" />
								</div>
								<h3 className="font-bold text-lg text-slate-900">
									Voltaze Organizer Team
								</h3>
								<p className="mt-1 text-slate-500 text-sm">
									Verified Event Partner
								</p>
								<div className="mt-4 flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="rounded-full text-xs"
									>
										<Mail className="mr-1 h-3.5 w-3.5" /> Contact
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="rounded-full text-xs"
									>
										<Share2 className="mr-1 h-3.5 w-3.5" /> Share
									</Button>
								</div>
							</div>
							<div>
								<h4 className="font-bold text-slate-900 text-xl">
									About the Organizer
								</h4>
								<p className="mt-3 text-slate-600 text-sm leading-relaxed">
									This event is hosted by the Voltaze programming and community
									partnerships team, focused on high-quality live experiences
									and reliable attendee support.
								</p>
								<div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
									<p>
										<span className="font-semibold text-slate-900">
											Support Hours:
										</span>{" "}
										10 AM - 7 PM
									</p>
									<p>
										<span className="font-semibold text-slate-900">
											Response Time:
										</span>{" "}
										Under 24 hours
									</p>
									<p>
										<span className="font-semibold text-slate-900">
											Language:
										</span>{" "}
										English, Hindi
									</p>
									<p>
										<span className="font-semibold text-slate-900">
											City Ops:
										</span>{" "}
										Pan India
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-16">
					<h2 className="mb-6 font-extrabold text-2xl text-black tracking-tight md:text-3xl">
						How to reach this spot
					</h2>
					<div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-md">
						<div
							className="relative flex h-100 w-full items-center justify-center bg-center bg-cover bg-slate-100"
							style={{
								backgroundImage:
									"url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80)",
							}}
						>
							<div className="absolute inset-0 bg-black/5" />
							<div className="relative flex max-w-70 flex-col gap-1 rounded-xl bg-white p-4 shadow-2xl">
								<span className="font-bold text-slate-800 text-xs">
									{event.venueName}
								</span>
								<span className="font-bold text-slate-800 text-xs">
									{event.address}
								</span>
								<div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 bg-white" />
							</div>
							<MapPin className="absolute bottom-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-[20%] fill-current text-red-600 drop-shadow-xl" />
						</div>
						<div className="flex items-center justify-center gap-12 border-slate-100 border-t bg-white py-6">
							<button
								type="button"
								className="flex items-center gap-2 font-bold text-blue-600 transition-colors hover:text-blue-800"
							>
								<Footprints className="h-5 w-5" /> Walking
							</button>
							<button
								type="button"
								className="flex items-center gap-2 font-bold text-blue-600 transition-colors hover:text-blue-800"
							>
								<Car className="h-5 w-5" /> Drive
							</button>
							<button
								type="button"
								className="flex items-center gap-2 font-bold text-blue-600 transition-colors hover:text-blue-800"
							>
								<Train className="h-5 w-5" /> Metro
							</button>
						</div>
					</div>
				</section>

				{relatedEvents.length > 0 && (
					<section className="mt-16">
						<div className="mb-6 flex items-end justify-between">
							<div>
								<h2 className="font-extrabold text-2xl text-black tracking-tight md:text-3xl">
									More Like This
								</h2>
								<p className="mt-1 text-slate-500 text-sm">
									Similar events based on mode, type, and nearby location.
								</p>
							</div>
							<Button asChild variant="outline" className="rounded-full">
								<a href="/events">Explore all</a>
							</Button>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
							{relatedEvents.map((relatedEvent) => (
								<EventCard key={relatedEvent.id} event={relatedEvent} />
							))}
						</div>
					</section>
				)}
			</div>
			<Footer />
		</div>
	);
}
