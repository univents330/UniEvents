"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth";
import { useEvent, useTicketTiers } from "@/features/events/hooks/use-events";
import { CheckoutSummary } from "@/features/payments/components/checkout-summary";
import {
	type CheckoutDraftItem,
	type CheckoutDraftTicketHolder,
	readCheckoutDraft,
	writeCheckoutDraft,
} from "@/features/payments/utils/checkout-session";
import { showNotification } from "@/shared/lib/notifications";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { Navbar } from "@/shared/ui/navbar";

function formatMoney(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function CheckoutAttendeePage({ slug }: { slug: string }) {
	const router = useRouter();
	const { data: user } = useCurrentUser();
	const { data: event, isLoading: isEventLoading } = useEvent(slug);
	const { data: tiersResponse } = useTicketTiers(event?.id ?? "");

	const [purchaserName, setPurchaserName] = useState("");
	const [purchaserEmail, setPurchaserEmail] = useState("");
	const [purchaserPhone, setPurchaserPhone] = useState("");
	const [tierQuantities, setTierQuantities] = useState<Record<string, number>>(
		{},
	);
	const [ticketHolders, setTicketHolders] = useState<
		CheckoutDraftTicketHolder[]
	>([]);

	const paidTiers = useMemo(
		() =>
			(tiersResponse?.data ?? [])
				.filter((tier) => tier.price > 0 && tier.soldCount < tier.maxQuantity)
				.sort((a, b) => a.price - b.price),
		[tiersResponse?.data],
	);

	const selectedItems = useMemo<CheckoutDraftItem[]>(
		() =>
			paidTiers
				.map((tier) => ({
					tierId: tier.id,
					quantity: tierQuantities[tier.id] ?? 0,
				}))
				.filter((item) => item.quantity > 0),
		[paidTiers, tierQuantities],
	);

	const selectedTiers = useMemo(
		() =>
			selectedItems
				.map((item) => {
					const tier = paidTiers.find((value) => value.id === item.tierId);
					if (!tier) {
						return null;
					}

					return {
						id: tier.id,
						name: tier.name,
						price: tier.price,
						quantity: item.quantity,
					};
				})
				.filter((value): value is NonNullable<typeof value> => Boolean(value)),
		[selectedItems, paidTiers],
	);

	const totalTickets = useMemo(
		() => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
		[selectedItems],
	);

	useEffect(() => {
		if (!user) {
			const redirectTo = encodeURIComponent(`/events/${slug}/checkout`);
			startTopLoader();
			router.replace(`/login?redirect=${redirectTo}`);
			return;
		}

		setPurchaserName((current) => current || user.name?.trim() || "");
		setPurchaserEmail((current) => current || user.email || "");
	}, [router, slug, user]);

	useEffect(() => {
		if (!event) {
			return;
		}

		if (event.type !== "PAID") {
			showNotification({
				title: "Free event",
				message: "This event does not require checkout.",
				color: "blue",
			});
			startTopLoader();
			router.replace(`/events/${event.slug}` as Route);
			return;
		}

		const draft = readCheckoutDraft(event.slug);
		if (draft) {
			setPurchaserName((current) => current || draft.purchaserName);
			setPurchaserEmail((current) => current || draft.purchaserEmail);
			setPurchaserPhone((current) => current || draft.purchaserPhone);

			setTierQuantities(() =>
				draft.items.reduce<Record<string, number>>((acc, item) => {
					acc[item.tierId] = item.quantity;
					return acc;
				}, {}),
			);

			setTicketHolders(draft.ticketHolders);
		}
	}, [event, router]);

	useEffect(() => {
		if (paidTiers.length === 0) {
			return;
		}

		setTierQuantities((current) => {
			const next: Record<string, number> = {};
			for (const tier of paidTiers) {
				next[tier.id] = Math.max(0, current[tier.id] ?? 0);
			}

			return next;
		});
	}, [paidTiers]);

	useEffect(() => {
		const holderSlots: string[] = [];
		for (const tier of paidTiers) {
			const quantity = tierQuantities[tier.id] ?? 0;
			for (let index = 0; index < quantity; index++) {
				holderSlots.push(`${tier.id}:${index}`);
			}
		}

		if (holderSlots.length === 0) {
			setTicketHolders([]);
			return;
		}

		setTicketHolders((current) => {
			const keyedCurrent = new Map(
				current.map((holder, index) => {
					const key = `${holder.tierId}:${index}`;
					return [key, holder];
				}),
			);

			return holderSlots.map((slot) => {
				const [tierId] = slot.split(":");
				return (
					keyedCurrent.get(slot) ?? {
						tierId,
						name: purchaserName.trim(),
						email: purchaserEmail.trim(),
						phone: purchaserPhone.trim(),
					}
				);
			});
		});
	}, [
		paidTiers,
		purchaserEmail,
		purchaserName,
		purchaserPhone,
		tierQuantities,
	]);

	const updateTierQuantity = (tierId: string, quantity: number) => {
		setTierQuantities((current) => ({
			...current,
			[tierId]: Math.max(0, quantity),
		}));
	};

	const updateTicketHolder = (
		index: number,
		field: "name" | "email" | "phone",
		value: string,
	) => {
		setTicketHolders((current) => {
			const next = [...current];
			next[index] = {
				...next[index],
				[field]: value,
			};
			return next;
		});
	};

	const handleContinue = () => {
		if (!event || selectedItems.length === 0) {
			showNotification({
				title: "Select a ticket",
				message: "Please select at least one ticket tier and quantity.",
				color: "red",
			});
			return;
		}

		if (!purchaserName.trim() || !purchaserEmail.trim()) {
			showNotification({
				title: "Missing attendee details",
				message: "Purchaser name and email are required.",
				color: "red",
			});
			return;
		}

		const hasInvalidHolder = ticketHolders.some(
			(holder) => !holder.name.trim() || !holder.email.trim(),
		);

		if (hasInvalidHolder) {
			showNotification({
				title: "Missing ticket holder details",
				message: "Each ticket holder must have a name and email.",
				color: "red",
			});
			return;
		}

		writeCheckoutDraft({
			eventId: event.id,
			eventSlug: event.slug,
			items: selectedItems,
			purchaserName: purchaserName.trim(),
			purchaserEmail: purchaserEmail.trim(),
			purchaserPhone: purchaserPhone.trim(),
			ticketHolders: ticketHolders.map((holder) => ({
				tierId: holder.tierId,
				name: holder.name.trim(),
				email: holder.email.trim(),
				phone: holder.phone.trim(),
			})),
		});

		startTopLoader();
		router.push(`/events/${event.slug}/checkout/payment` as Route);
	};

	if (isEventLoading || !event) {
		return (
			<div className="min-h-screen bg-[#f7f8fb]">
				<Navbar />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f8fb]">
			<Navbar />
			<div className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 px-3 pb-8 sm:mt-10 sm:gap-7 sm:px-4 sm:pb-10 md:mt-12 md:gap-8 md:px-6 md:pb-12 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:gap-10">
				<section className="rounded-xl bg-[#e8eefc] p-4 shadow-sm sm:rounded-2xl sm:p-6 md:p-8">
					<h1 className="font-bold text-2xl text-[#0f172a] sm:text-3xl md:text-4xl lg:text-4xl">
						Attendee Information
					</h1>
					<p className="mt-1 text-[#64748b] text-xs sm:mt-2 sm:text-sm">
						Tell us who is joining the experience. This information will appear
						on your digital tickets.
					</p>

					<div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4 md:mt-7">
						<div>
							<label
								htmlFor="attendee-name"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Purchaser Full Name
							</label>
							<Input
								id="purchaser-name"
								value={purchaserName}
								onChange={(e) => setPurchaserName(e.target.value)}
								placeholder="John Doe"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
						<div>
							<label
								htmlFor="attendee-email"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Purchaser Email Address
							</label>
							<Input
								id="purchaser-email"
								value={purchaserEmail}
								onChange={(e) => setPurchaserEmail(e.target.value)}
								placeholder="john@email.com"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
						<div>
							<label
								htmlFor="attendee-phone"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Purchaser Whatsapp Number
							</label>
							<Input
								id="purchaser-phone"
								value={purchaserPhone}
								onChange={(e) => setPurchaserPhone(e.target.value)}
								placeholder="0000 0000 000"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
					</div>

					<p className="mt-4 text-[#64748b] text-xs sm:mt-5 md:mt-6">
						Your digital ticket and QR code will be sent on your email and
						Whatsapp.
					</p>

					<div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-2.5 md:mt-4 md:gap-3">
						{paidTiers.map((tier, index) => {
							const isSelected = selectedTier?.id === tier.id;
							return (
								<div
									key={tier.id}
									onClick={() => setSelectedTierId(tier.id)}
									className={`rounded-lg border p-3 text-left transition sm:rounded-xl sm:p-3.5 md:p-4 ${
										isSelected
											? "border-[#1d4ed8] bg-white"
											: "border-transparent bg-white/70"
									}`}
								>
									{index === 0 && (
										<span className="mb-1 inline-flex rounded-full bg-[#dbeafe] px-2 py-0.5 font-semibold text-[#1d4ed8] text-[10px] uppercase">
											Best Value
										</span>
									)}
									<p className="font-semibold text-slate-900 text-xs sm:text-sm">
										{tier.name}
									</p>
									<p className="font-bold text-[#2563eb] text-xs sm:text-sm">
										{formatMoney(tier.price)}
									</p>
									<p className="mt-1 text-slate-500 text-xs">
										{remaining} seats left
									</p>
									<div className="mt-3 flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											className="h-8 w-8 rounded-full p-0"
											onClick={() =>
												updateTierQuantity(tier.id, Math.max(0, quantity - 1))
											}
										>
											-
										</Button>
										<Input
											type="number"
											min={0}
											max={remaining}
											value={quantity}
											onChange={(e) =>
												updateTierQuantity(
													tier.id,
													Math.min(remaining, Number(e.target.value) || 0),
												)
											}
											className="h-8 w-20 border-0 bg-white text-center"
										/>
										<Button
											type="button"
											variant="outline"
											className="h-8 w-8 rounded-full p-0"
											onClick={() =>
												updateTierQuantity(
													tier.id,
													Math.min(remaining, quantity + 1),
												)
											}
										>
											+
										</Button>
									</div>
								</div>
							);
						})}
					</div>

					{totalTickets > 0 && (
						<div className="mt-6 space-y-4">
							<h2 className="font-semibold text-[#0f172a] text-lg">
								Ticket Holder Details ({totalTickets})
							</h2>
							{ticketHolders.map((holder, index) => {
								const tierName =
									paidTiers.find((tier) => tier.id === holder.tierId)?.name ??
									"Ticket";

								return (
									<div
										key={`${holder.tierId}-${index}`}
										className="rounded-xl border border-slate-200 bg-white p-4"
									>
										<p className="font-semibold text-slate-900 text-sm">
											Ticket {index + 1} - {tierName}
										</p>
										<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
											<Input
												value={holder.name}
												onChange={(e) =>
													updateTicketHolder(index, "name", e.target.value)
												}
												placeholder="Holder name"
												className="h-10 border border-slate-200 bg-white"
											/>
											<Input
												value={holder.email}
												onChange={(e) =>
													updateTicketHolder(index, "email", e.target.value)
												}
												placeholder="Holder email"
												className="h-10 border border-slate-200 bg-white"
											/>
											<Input
												value={holder.phone}
												onChange={(e) =>
													updateTicketHolder(index, "phone", e.target.value)
												}
												placeholder="Holder phone (optional)"
												className="h-10 border border-slate-200 bg-white"
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}

					<Button
						onClick={handleContinue}
						className="mt-5 h-10 w-full rounded-full bg-[#070190] font-semibold text-sm text-white hover:bg-[#030370] sm:mt-6 sm:h-11 sm:text-base md:mt-7 md:h-12"
					>
						Continue To Pay
					</Button>
				</section>

				<CheckoutSummary event={event} selectedTiers={selectedTiers} />
			</div>
		</div>
	);
}
