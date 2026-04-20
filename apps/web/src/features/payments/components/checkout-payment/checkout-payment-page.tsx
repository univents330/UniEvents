"use client";

import { useQueryClient } from "@tanstack/react-query";
import { env } from "@voltaze/env/web";
import type { Route } from "next";
import { useRouter } from "next/navigation";
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

	const selectedItems = useMemo(
		() => draftState?.items ?? [],
		[draftState?.items],
	);

	const checkoutAmountMinor = useMemo(() => {
		if (!draftState) {
			return 0;
		}

		const tierMap = new Map(paidTiers.map((tier) => [tier.id, tier]));
		return draftState.items.reduce((total, item) => {
			const tier = tierMap.get(item.tierId);
			if (!tier) {
				return total;
			}

			return total + tier.price * item.quantity * 100;
		}, 0);
	}, [draftState, paidTiers]);

	const checkoutDescription = useMemo(() => {
		const totalCount = selectedItems.reduce(
			(sum, item) => sum + item.quantity,
			0,
		);
		return `${totalCount} ticket${totalCount > 1 ? "s" : ""} for ${event?.name ?? "event"}`;
	}, [event?.name, selectedItems]);

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
			router.replace(`/events/${slug}/checkout` as Route);
			return;
		}
	}, [draftState, router, slug, user]);

	useEffect(() => {
		if (!event) {
			return;
		}

		if (event.type !== "PAID") {
			startTopLoader();
			router.replace(`/events/${event.slug}` as Route);
		}
	}, [event, router]);

	const handlePayNow = useCallback(async () => {
		if (!event || !draftState || selectedItems.length === 0) {
			showNotification({
				title: "Missing checkout details",
				message: "Please complete attendee details before payment.",
				color: "red",
			});
			return;
		}

		setIsPaying(true);

		try {
			const attendeeResponse = await attendeesService.getAttendees({
				eventId: event.id,
				page: 1,
				limit: 50,
				sortBy: "createdAt",
				sortOrder: "desc",
			});

			const attendee =
				attendeeResponse.data.find(
					(item) =>
						item.email.toLowerCase() ===
						draftState.purchaserEmail.toLowerCase(),
				) ??
				(await attendeesService.createAttendee({
					eventId: event.id,
					name: draftState.purchaserName,
					email: draftState.purchaserEmail,
					phone: draftState.purchaserPhone || null,
				}));

			const order = await ordersService.createOrder({
				attendeeId: attendee.id,
				eventId: event.id,
			});

			if (checkoutAmountMinor === 0) {
				await paymentsService.confirmFreeOrder({
					orderId: order.id,
					currency: "INR",
					items: selectedItems,
					ticketHolders: draftState.ticketHolders,
				});

				clearCheckoutDraft(event.slug);
				await queryClient.invalidateQueries({ queryKey: ["orders"] });
				await queryClient.invalidateQueries({ queryKey: ["payments"] });
				await queryClient.invalidateQueries({ queryKey: ["events"] });

				showNotification({
					title: "Booking confirmed",
					message: "Free tickets generated. Confirmation email has been sent.",
					color: "green",
				});

				startTopLoader();
				router.push(`/events/${event.slug}` as Route);
				setIsPaying(false);
				return;
			}

			await loadRazorpayCheckoutScript();

			const payment = await paymentsService.initiatePayment({
				orderId: order.id,
				currency: "INR",
				items: selectedItems,
				ticketHolders: draftState.ticketHolders,
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
				description: checkoutDescription,
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
						router.push(`/events/${event.slug}` as Route);
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
	}, [
		checkoutAmountMinor,
		checkoutDescription,
		draftState,
		event,
		queryClient,
		router,
		selectedItems,
	]);

	useEffect(() => {
		if (
			!event ||
			!draftState ||
			selectedItems.length === 0 ||
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
		selectedItems.length,
	]);

	if (isEventLoading || !event || !draftState || selectedItems.length === 0) {
		return (
			<div className="min-h-screen bg-[#f7f8fb]">
				<Navbar />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f8fb]">
			<Navbar />
			<div className="mx-auto mt-12 w-full max-w-2xl px-3 pb-8 sm:mt-16 sm:px-4 sm:pb-10 md:mt-20 md:px-6 md:pb-12 lg:mt-24">
				<section className="rounded-xl bg-[#e8eefc] p-5 text-center shadow-sm sm:rounded-2xl sm:p-6 md:p-8">
					<h1 className="font-bold text-2xl text-[#0f172a] sm:text-3xl md:text-3xl lg:text-3xl">
						Opening secure checkout
					</h1>
					<p className="mt-2 text-[#64748b] text-xs sm:text-sm">
						Please wait while we launch Razorpay for your booking.
					</p>
					<p className="mt-4 font-semibold text-[#070190] text-xs sm:mt-5 sm:text-sm md:mt-6 md:text-base">
						{isPaying
							? "Starting payment..."
							: `Amount: ${formatMoney(checkoutAmountMinor)}`}
					</p>
				</section>
			</div>
		</div>
	);
}
