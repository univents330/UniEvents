"use client";

import { useQueryClient } from "@tanstack/react-query";
import { env } from "@voltaze/env/web";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { attendeesService } from "@/features/attendees/services/attendees.service";
import { useCurrentUser } from "@/features/auth";
import { useEvent, useTicketTiers } from "@/features/events/hooks/use-events";
import { ordersService } from "@/features/orders/services/orders.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import {
	clearCheckoutDraft,
	readCheckoutDraft,
} from "@/features/payments/utils/checkout-session";
import { loadRazorpayCheckoutScript } from "@/features/payments/utils/razorpay";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { Navbar } from "@/shared/ui/navbar";

function formatMoney(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount / 100);
}

export function CheckoutPaymentPage({ slug }: { slug: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { data: user } = useCurrentUser();
	const { data: event, isLoading: isEventLoading } = useEvent(slug);
	const { data: tiersResponse } = useTicketTiers(event?.id ?? "");
	const [isPaying, setIsPaying] = useState(false);
	const [hasStartedCheckout, setHasStartedCheckout] = useState(false);
	const [draftState] = useState(() => readCheckoutDraft(slug));

	const paidTiers = useMemo(
		() =>
			(tiersResponse?.data ?? [])
				.filter((tier) => tier.price > 0 && tier.soldCount < tier.maxQuantity)
				.sort((a, b) => a.price - b.price),
		[tiersResponse?.data],
	);

	const requestedTierId = searchParams.get("tierId");
	const selectedTier =
		paidTiers.find((tier) => tier.id === requestedTierId) ||
		paidTiers.find((tier) => tier.id === draftState?.tierId) ||
		null;

	useEffect(() => {
		if (!user) {
			const redirectTo = encodeURIComponent(`/events/${slug}/checkout`);
			startTopLoader();
			router.replace(`/login?redirect=${redirectTo}`);
			return;
		}

		if (!draftState) {
			showNotification({
				title: "Checkout details missing",
				message: "Please complete attendee information first.",
				color: "blue",
			});
			startTopLoader();
			router.replace(`/events/${slug}/checkout`);
			return;
		}
	}, [draftState, router, slug, user]);

	useEffect(() => {
		if (!event) {
			return;
		}

		if (event.type !== "PAID") {
			startTopLoader();
			router.replace(`/events/${event.slug}`);
		}
	}, [event, router]);

	const handlePayNow = useCallback(async () => {
		if (!event || !selectedTier || !draftState) {
			showNotification({
				title: "Missing checkout details",
				message: "Please complete attendee details before payment.",
				color: "red",
			});
			return;
		}

		setIsPaying(true);

		try {
			await loadRazorpayCheckoutScript();

			const attendeeResponse = await attendeesService.getAttendees({
				eventId: event.id,
				page: 1,
				limit: 50,
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			const attendee =
				attendeeResponse.data.find(
					(item) => item.email.toLowerCase() === draftState.email.toLowerCase(),
				) ??
				(await attendeesService.createAttendee({
					eventId: event.id,
					name: draftState.name,
					email: draftState.email,
					phone: draftState.phone || null,
				}));

			const order = await ordersService.createOrder({
				attendeeId: attendee.id,
				eventId: event.id,
			});

			const payment = await paymentsService.initiatePayment({
				orderId: order.id,
				currency: "INR",
				items: [
					{ tierId: selectedTier.id, quantity: draftState.quantity || 1 },
				],
			});

			const razorpayKeyId =
				payment.razorpayKeyId || env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

			if (!razorpayKeyId || !window.Razorpay) {
				throw new Error("Razorpay checkout is not available");
			}

			const checkout = new window.Razorpay({
				key: razorpayKeyId,
				amount: payment.amount,
				currency: payment.currency,
				order_id: payment.razorpayOrderId,
				name: event.name,
				description: `${selectedTier.name} ticket for ${event.name}`,
				prefill: payment.prefill,
				notes: payment.notes,
				theme: {
					color: "#070190",
				},
				modal: {
					ondismiss: () => setIsPaying(false),
				},
				handler: async (response) => {
					try {
						await paymentsService.verifyPayment({
							razorpayOrderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
						});

						clearCheckoutDraft(event.slug);
						await queryClient.invalidateQueries({ queryKey: ["orders"] });
						await queryClient.invalidateQueries({ queryKey: ["payments"] });
						await queryClient.invalidateQueries({ queryKey: ["events"] });

						showNotification({
							title: "Booking confirmed",
							message: "Payment successful. Your ticket is being processed.",
							color: "green",
						});
						startTopLoader();
						router.push(`/events/${event.slug}`);
					} catch (error) {
						showNotification({
							title: "Payment verification failed",
							message: getApiErrorMessage(
								error,
								"We could not verify your payment.",
							),
							color: "red",
						});
					} finally {
						setIsPaying(false);
					}
				},
			});

			checkout.open();
		} catch (error) {
			setIsPaying(false);
			showNotification({
				title: "Checkout failed",
				message: getApiErrorMessage(
					error,
					"Unable to start Razorpay checkout.",
				),
				color: "red",
			});
		}
	}, [draftState, event, queryClient, router, selectedTier]);

	useEffect(() => {
		if (
			!event ||
			!selectedTier ||
			!draftState ||
			isPaying ||
			hasStartedCheckout
		) {
			return;
		}

		setHasStartedCheckout(true);
		void handlePayNow();
	}, [
		draftState,
		event,
		hasStartedCheckout,
		handlePayNow,
		isPaying,
		selectedTier,
	]);

	if (isEventLoading || !event || !draftState) {
		return (
			<div className="min-h-screen bg-[#f7f8fb]">
				<Navbar />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f8fb]">
			<Navbar />
			<div className="mx-auto mt-24 w-full max-w-2xl px-6 pb-12">
				<section className="rounded-2xl bg-[#e8eefc] p-8 text-center shadow-sm">
					<h1 className="font-bold text-3xl text-[#0f172a]">
						Opening secure checkout
					</h1>
					<p className="mt-2 text-[#64748b] text-sm">
						Please wait while we launch Razorpay for your booking.
					</p>
					<p className="mt-6 font-semibold text-[#070190] text-sm">
						{isPaying
							? "Starting payment..."
							: `Amount: ${selectedTier ? formatMoney(selectedTier.price) : "-"}`}
					</p>
				</section>
			</div>
		</div>
	);
}
