"use client";

import dayjs from "dayjs";
import {
	ArrowRight,
	Check,
	ChevronLeft,
	Heart,
	Minus,
	Plus,
	Share2,
	ShieldCheck,
	ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/core/lib/cn";
import { useCart } from "@/core/providers/cart-provider";
import { useHostProfile } from "../../auth/hooks/use-users";
import { useEvent, useEventTicketTiers } from "../hooks/use-events";

export function EventDetailView({ eventId }: { eventId: string }) {
	const eventQuery = useEvent(eventId);
	const tiersQuery = useEventTicketTiers(eventId);
	const event = eventQuery.data;
	const tiers = tiersQuery.data?.data ?? [];

	const hostQuery = useHostProfile(event?.userId as string);
	const host = hostQuery.data;

	const { addItem } = useCart();
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [isAdding, setIsAdding] = useState(false);
	const [added, setAdded] = useState(false);

	const totalPrice = useMemo(() => {
		return Object.entries(quantities).reduce((total, [tierId, qty]) => {
			const tier = tiers.find((t) => t.id === tierId);
			return total + (tier?.price ?? 0) * qty;
		}, 0);
	}, [quantities, tiers]);

	const totalTickets = useMemo(() => {
		return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
	}, [quantities]);

	const updateQuantity = (tierId: string, delta: number) => {
		setQuantities((prev) => {
			const current = prev[tierId] ?? 0;
			const next = Math.max(0, current + delta);
			if (next === 0) {
				const { [tierId]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [tierId]: next };
		});
		setAdded(false);
	};

	const handleAddToCart = () => {
		if (totalTickets === 0 || !event) return;

		setIsAdding(true);

		// Add each selected tier to the global cart
		Object.entries(quantities).forEach(([tierId, qty]) => {
			const tier = tiers.find((t) => t.id === tierId);
			if (tier && qty > 0) {
				addItem({
					id: `${eventId}-${tierId}`,
					eventId: event.id,
					eventName: event.name,
					tierId: tier.id,
					tierName: tier.name,
					price: tier.price,
					quantity: qty,
					image: event.coverUrl,
				});
			}
		});

		setTimeout(() => {
			setIsAdding(false);
			setAdded(true);
			toast.success("Added to cart", {
				description: `${totalTickets} passes for ${event.name} have been added.`,
			});
			// Optionally clear local quantities
			setQuantities({});
		}, 600);
	};

	if (eventQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-100 border-t-[#000031]" />
			</div>
		);
	}

	if (eventQuery.isError || !event) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<p className="font-bold text-slate-400 text-sm">
					Event identification failed.
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pt-20 pb-40 font-jakarta">
			<div className="container mx-auto px-6 pt-12">
				<div className="mx-auto max-w-7xl">
					{/* Actions Header */}
					<div className="mb-24 flex items-center justify-between border-slate-100 border-b pb-8">
						<Link
							href="/discover"
							className="inline-flex items-center gap-2 font-black text-[#000031]/40 text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-[#000031]"
						>
							<ChevronLeft size={14} /> Back to Discover
						</Link>
						<div className="flex items-center gap-8">
							<button
								type="button"
								className="flex items-center gap-2 font-black text-[#000031]/40 text-[10px] uppercase tracking-widest transition-colors hover:text-[#000031]"
							>
								<Share2 size={14} /> Share
							</button>
							<button
								type="button"
								className="flex items-center gap-2 font-black text-[#000031]/40 text-[10px] uppercase tracking-widest transition-colors hover:text-red-500"
							>
								<Heart size={14} /> Save
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-24 lg:grid-cols-12">
						{/* Detailed Content */}
						<div className="space-y-32 lg:col-span-8">
							{/* Minimal Hero Header */}
							<section className="space-y-12">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<span className="font-black text-[10px] text-blue-600 uppercase tracking-[0.3em]">
											{event.type}
										</span>
										<div className="h-1 w-1 rounded-full bg-slate-200" />
										<span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
											{event.mode} Experience
										</span>
									</div>
									<h1 className="font-black text-6xl text-[#000031] leading-[0.9] tracking-tighter md:text-8xl">
										{event.name}
									</h1>
								</div>

								<div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
									<Image
										src={event.coverUrl || "/assets/welcome.png"}
										alt={event.name}
										fill
										className="object-cover"
										priority
									/>
								</div>
							</section>

							{/* Narrative Summary */}
							<section className="space-y-12">
								<h2 className="font-black text-slate-300 text-xs uppercase tracking-[0.4em]">
									Description
								</h2>
								<p className="max-w-4xl whitespace-pre-wrap font-bold text-2xl text-[#000031]/70 leading-relaxed">
									{event.description}
								</p>
							</section>

							{/* Elite Intuitive Data Hub */}
							<section className="grid grid-cols-1 gap-24 border-slate-100 border-y py-24 md:grid-cols-2">
								{/* Temporal Intelligence */}
								<div className="space-y-12">
									<h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em]">
										Phase Timeline
									</h3>
									<div className="flex flex-col gap-12">
										<div className="space-y-1">
											<p className="font-black text-4xl text-[#000031] tracking-tighter">
												{dayjs(event.startDate).format("dddd")}
											</p>
											<p className="font-bold text-slate-400 text-xl">
												{dayjs(event.startDate).format("MMMM DD, YYYY")}
											</p>
										</div>

										<div className="space-y-6 border-slate-50 border-t pt-6">
											<div className="flex items-center justify-between">
												<div className="flex flex-col">
													<span className="mb-1 font-black text-[10px] text-slate-300 uppercase tracking-widest">
														Morning
													</span>
													<span className="font-black text-[#000031] text-xs">
														00:00
													</span>
												</div>
												<div className="flex flex-col items-center">
													<span className="mb-1 font-black text-[10px] text-blue-600 uppercase tracking-widest">
														Event Window
													</span>
													<span className="font-black text-[#000031] text-sm">
														{dayjs(event.startDate).format("HH:mm")} —{" "}
														{dayjs(event.endDate).format("HH:mm")}
													</span>
												</div>
												<div className="flex flex-col items-end">
													<span className="mb-1 font-black text-[10px] text-slate-300 uppercase tracking-widest">
														Midnight
													</span>
													<span className="font-black text-[#000031] text-xs">
														24:00
													</span>
												</div>
											</div>

											{/* Intuitive 24H Scale Bar */}
											<div className="group relative h-4 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
												<div className="pointer-events-none absolute inset-0 flex justify-between px-[8.33%] opacity-[0.05]">
													{[...Array(11)].map((_, i) => (
														<div
															key={i}
															className="h-full w-[1px] bg-[#000031]"
														/>
													))}
												</div>
												<div
													className="absolute inset-y-0 rounded-md bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-700"
													style={{
														left: `${(dayjs(event.startDate).hour() * 60 + dayjs(event.startDate).minute()) / 14.4}%`,
														width: `${dayjs(event.endDate).diff(dayjs(event.startDate), "minute") / 14.4}%`,
													}}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Geospatial Intelligence */}
								<div className="space-y-12">
									<h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em]">
										Hub Location
									</h3>
									<div className="flex flex-col gap-10">
										<div className="space-y-4">
											<div className="inline-flex items-center gap-2 rounded bg-blue-50 px-3 py-1 font-black text-[8px] text-blue-600 uppercase tracking-[0.3em]">
												{event.mode} Access Verified
											</div>
											<h3 className="font-black text-5xl text-[#000031] uppercase leading-none tracking-tighter">
												{event.venueName}
											</h3>
										</div>

										<div className="space-y-6 border-slate-50 border-t pt-6">
											<div className="flex flex-col gap-2">
												<span className="font-black text-[10px] text-slate-300 uppercase tracking-widest">
													Physical Node
												</span>
												<p className="font-bold text-lg text-slate-500 leading-tight">
													{event.address.split(",").slice(0, 3).join(",")}
												</p>
											</div>

											<div className="flex items-center gap-4 font-black text-[9px] text-blue-600/40 uppercase tracking-[0.2em]">
												<span>Region</span>
												<ArrowRight size={10} />
												<span>District</span>
												<ArrowRight size={10} />
												<span className="text-blue-600">Hub Venue</span>
											</div>
										</div>
									</div>
								</div>
							</section>

							{/* Minimal Organizer Profile */}
							<section className="flex items-center gap-8 border-slate-100 border-t pt-24">
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
									{host?.image ? (
										<Image
											src={host.image}
											alt={host.name ?? ""}
											width={64}
											height={64}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center font-black text-slate-300">
											{host?.name?.[0] ?? "U"}
										</div>
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<h3 className="truncate font-black text-[#000031] text-lg">
											{host?.name ?? "Institution Account"}
										</h3>
										<ShieldCheck size={14} className="shrink-0 text-blue-600" />
									</div>
									<p className="font-bold text-slate-400 text-xs">
										Official platform organizer for UniEvent
									</p>
								</div>
							</section>

							{/* Pure Map Embed */}
							{event.mode === "OFFLINE" && (
								<section className="space-y-12 py-16">
									<h2 className="font-black text-slate-300 text-xs uppercase tracking-[0.4em]">
										Coordinates
									</h2>
									<div className="h-[500px] w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm grayscale transition-all duration-700 hover:grayscale-0">
										<iframe
											width="100%"
											height="100%"
											frameBorder="0"
											scrolling="no"
											marginHeight={0}
											marginWidth={0}
											title="Event location map"
											src={`https://maps.google.com/maps?q=${event.latitude},${event.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
										/>
									</div>
								</section>
							)}
						</div>

						{/* Transaction Hub - Integrated with Global Cart */}
						<aside className="h-fit lg:sticky lg:top-32 lg:col-span-4">
							<div className="space-y-12">
								<h3 className="font-black text-slate-300 text-xs uppercase tracking-[0.4em]">
									Access Control
								</h3>

								<div className="space-y-6">
									{tiers.map((tier) => {
										const qty = quantities[tier.id] ?? 0;
										const isSelected = qty > 0;
										const priceInRupee = tier.price / 100;

										return (
											<div
												key={tier.id}
												className={cn(
													"group rounded-xl border p-6 transition-all duration-500",
													isSelected
														? "border-blue-600 bg-blue-50/20 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)]"
														: "border-slate-100 bg-white hover:border-slate-200",
												)}
											>
												<div className="mb-6 flex items-center justify-between gap-6">
													<div className="space-y-1">
														<p
															className={cn(
																"font-black text-xs uppercase tracking-tight transition-colors",
																isSelected ? "text-blue-700" : "text-[#000031]",
															)}
														>
															{tier.name}
														</p>
														<p className="font-black text-2xl text-[#000031]">
															₹{priceInRupee.toLocaleString()}
														</p>
													</div>
													<div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
														<button
															type="button"
															onClick={() => updateQuantity(tier.id, -1)}
															className="flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:text-[#000031]"
														>
															<Minus size={14} />
														</button>
														<span className="w-4 text-center font-black text-[#000031] text-xs">
															{qty}
														</span>
														<button
															type="button"
															onClick={() => updateQuantity(tier.id, 1)}
															className="flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:text-[#000031]"
														>
															<Plus size={14} />
														</button>
													</div>
												</div>
												{tier.description && (
													<div className="border-slate-50 border-t pt-4">
														<p className="font-bold text-[9px] text-slate-400 uppercase leading-relaxed tracking-widest">
															{tier.description}
														</p>
													</div>
												)}
											</div>
										);
									})}
								</div>

								<div className="space-y-10 border-slate-100 border-t pt-12">
									<div className="flex items-end justify-between">
										<div className="space-y-1">
											<span className="font-black text-[10px] text-slate-300 uppercase tracking-widest">
												Net Accumulation
											</span>
											<p className="font-black text-4xl text-[#000031]">
												₹{(totalPrice / 100).toLocaleString()}
											</p>
										</div>
										<div className="text-right">
											<span className="font-black text-[10px] text-blue-600 uppercase tracking-widest">
												{totalTickets} Passes
											</span>
										</div>
									</div>

									<div className="space-y-4">
										<button
											type="button"
											onClick={handleAddToCart}
											disabled={totalTickets === 0 || isAdding}
											className={cn(
												"flex h-16 w-full items-center justify-center gap-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all",
												totalTickets > 0
													? "bg-[#000031] text-white shadow-2xl shadow-[#000031]/10"
													: "cursor-not-allowed bg-slate-50 text-slate-200",
											)}
										>
											{isAdding ? (
												<div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
											) : added ? (
												<>
													<Check size={16} /> Added to Cart
												</>
											) : (
												<>
													<ShoppingCart size={16} /> Add to Cart
												</>
											)}
										</button>

										{added && (
											<Link
												href="/cart"
												className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-[#000031] font-black text-[#000031] text-[10px] uppercase tracking-widest transition-all duration-300 hover:bg-[#000031] hover:text-white"
											>
												View Cart & Checkout <ArrowRight size={14} />
											</Link>
										)}
									</div>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
