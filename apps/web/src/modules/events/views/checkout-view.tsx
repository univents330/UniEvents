"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { useCreateAttendee } from "@/modules/attendees/hooks/use-attendees";
import { useCreateOrder } from "@/modules/orders/hooks/use-orders";
import {
	useConfirmFreeOrder,
	useInitiatePayment,
} from "@/modules/payments/hooks/use-payments";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";
import { useEvent, useEventTicketTiers } from "../hooks/use-events";

export function CheckoutView({ eventId }: { eventId: string }) {
	const router = useRouter();
	const eventQuery = useEvent(eventId);
	const tiersQuery = useEventTicketTiers(eventId);
	const event = eventQuery.data;
	const tiers = tiersQuery.data?.data ?? [];

	const [selectedTierId, setSelectedTierId] = useState<string>("");
	const [quantity, setQuantity] = useState(1);
	const [isProcessing, setIsProcessing] = useState(false);

	const selectedTier = tiers.find((t) => t.id === selectedTierId);

	const { user } = useAuth();
	const createAttendeeEntry = useCreateAttendee();
	const createOrderEntry = useCreateOrder();
	const initiatePaymentEntry = useInitiatePayment();
	const confirmFreeOrderEntry = useConfirmFreeOrder();

	const loadRazorpayPaymentGateway = () => {
		return new Promise((resolve) => {
			if (
				document.querySelector(
					'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
				)
			) {
				return resolve(true);
			}
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	async function handleCheckout(e: React.FormEvent) {
		e.preventDefault();
		if (!selectedTierId || !user) return;

		setIsProcessing(true);

		try {
			let attendeeData: { id: string } | undefined;
			try {
				attendeeData = await createAttendeeEntry.mutateAsync({
					eventId,
					userId: user.id,
					name: user.name ?? "Attendee",
					email: user.email,
				});
			} catch (err: unknown) {
				// If 409 Conflict (already exists), we shouldn't fail but ideally reuse it.
				// Since we don't have the attendeeId, we might fail unless we can find it.
				if (
					err &&
					typeof err === "object" &&
					"response" in err &&
					typeof err.response === "object" &&
					err.response !== null &&
					"status" in err.response &&
					err.response.status === 409
				) {
					alert(
						"You are already registered! Please manage tickets from the dashboard.",
					);
					return;
				}
				throw err;
			}

			const orderData = await createOrderEntry.mutateAsync({
				eventId,
				attendeeId: attendeeData.id,
			});

			// If it's a FREE tier, confirm immediately
			if (selectedTier?.price === 0) {
				await confirmFreeOrderEntry.mutateAsync({
					orderId: orderData.id,
					currency: "INR",
					items: [{ tierId: selectedTierId, quantity }],
				});
				router.push("/orders");
				return;
			}

			const rzrResult = await initiatePaymentEntry.mutateAsync({
				orderId: orderData.id,
				currency: "INR",
				items: [{ tierId: selectedTierId, quantity }],
			});

			const res = await loadRazorpayPaymentGateway();
			if (!res) {
				alert("Razorpay SDK failed to load. Are you online?");
				return;
			}

			const options = {
				key: rzrResult.razorpayKeyId,
				amount: rzrResult.amount,
				currency: rzrResult.currency,
				name: "UniEvents",
				description: `Passes for ${event?.name}`,
				order_id: rzrResult.razorpayOrderId,
				handler: (response: {
					razorpay_payment_id?: string;
					razorpay_order_id?: string;
					razorpay_signature?: string;
				}) => {
					router.push("/orders");
				},
				prefill: {
					name: user.name,
					email: user.email,
				},
				theme: {
					color: "#1264db",
				},
			};

			const rzp1 = new (
				window as typeof window & {
					Razorpay: new (
						options: unknown,
					) => {
						open: () => void;
						on: (
							event: string,
							handler: (response: { error?: { description?: string } }) => void,
						) => void;
					};
				}
			).Razorpay(options);
			rzp1.on("payment.failed", (response: unknown) => {
				if (response && typeof response === "object" && "error" in response) {
					const error = response as { error?: { description?: string } };
					alert(error.error?.description || "Payment failed");
				} else {
					alert("Payment failed");
				}
			});
			rzp1.open();
		} catch (err: unknown) {
			console.error(err);
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			alert(`Checkout failed: ${errorMessage}`);
		} finally {
			setIsProcessing(false);
		}
	}

	if (eventQuery.isLoading || tiersQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading checkout...</div>
		);
	}

	if (eventQuery.isError || !event) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load event details.
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-8">
			<SectionTitle
				eyebrow="Checkout"
				title={`Get passes for ${event.name}`}
				description="Select a ticket tier, choose quantity, and secure your spot."
			/>

			<div className="panel-soft p-6 md:p-8">
				<form onSubmit={handleCheckout} className="space-y-6">
					<div className="space-y-3">
						<div className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Select ticket tier
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{tiers.map((tier) => (
								<button
									key={tier.id}
									type="button"
									onClick={() => setSelectedTierId(tier.id)}
									className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
										selectedTierId === tier.id
											? "border-[#1264db] bg-[#f4f7ff] ring-1 ring-[#1264db]"
											: "border-[#d7e0f8] bg-white hover:border-[#1264db]"
									}`}
								>
									<span className="font-bold text-[#0e1838]">{tier.name}</span>
									<span className="mt-1 font-semibold text-[#1264db]">
										{tier.price === 0
											? "Free"
											: new Intl.NumberFormat("en", {
													style: "currency",
													currency: "INR",
													maximumFractionDigits: 0,
												}).format(tier.price)}
									</span>
									{tier.maxQuantity && (
										<span className="mt-2 text-[#5f6984] text-xs">
											Limit: {tier.maxQuantity} per order
										</span>
									)}
								</button>
							))}
							{tiers.length === 0 && (
								<p className="text-[#5f6984] text-sm">
									No ticket tiers currently available.
								</p>
							)}
						</div>
					</div>

					{selectedTier && (
						<div className="space-y-3">
							<label
								htmlFor="quantity-select"
								className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
							>
								Quantity
							</label>
							<select
								id="quantity-select"
								value={quantity}
								onChange={(e) => setQuantity(Number(e.target.value))}
								className="h-11 w-full max-w-[200px] rounded-xl border border-[#d4def8] bg-white px-3 text-[#19254a] text-sm outline-none transition-colors focus:border-[#3a59d6]"
							>
								{Array.from(
									{ length: selectedTier.maxQuantity || 10 },
									(_, i) => i + 1,
								).map((num) => (
									<option key={num} value={num}>
										{num}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="my-6 border-[#d7e0f8] border-t" />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-semibold text-[#5f6984] text-sm">Total due</p>
							<p className="display-font font-bold text-2xl text-[#0e1838]">
								{!selectedTier
									? "—"
									: selectedTier.price === 0
										? "Free"
										: new Intl.NumberFormat("en", {
												style: "currency",
												currency: "INR",
												maximumFractionDigits: 0,
											}).format(selectedTier.price * quantity)}
							</p>
						</div>

						<Button
							type="submit"
							size="lg"
							disabled={!selectedTierId || isProcessing}
						>
							{isProcessing ? "Processing gateway..." : "Confirm & Pay"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
