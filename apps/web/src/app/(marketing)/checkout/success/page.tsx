"use client";

import {
	CheckCircle2,
	ChevronRight,
	Download,
	Loader2,
	Mail,
	Share2,
	Ticket,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Suspense, useRef } from "react";
import { ordersService } from "@/modules/orders/services/orders.service";
import { useGuestPayment } from "@/modules/payments/hooks/use-payments";

function CheckoutSuccessContent() {
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("paymentId");
	const {
		data: payment,
		isLoading,
		error,
	} = useGuestPayment(paymentId ?? undefined);
	const qrCodeRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

	const order = payment?.order;
	const tickets = order?.tickets ?? [];
	const event = order?.event;
	const attendee = order?.attendee;

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<Loader2 className="h-8 w-8 animate-spin text-slate-900" />
			</div>
		);
	}

	if (error || !payment) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="text-center">
					<p className="font-semibold text-2xl text-slate-900">
						Payment not found
					</p>
					<Link
						href="/dashboard"
						className="mt-4 inline-block font-medium text-blue-600 text-sm hover:underline"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	if (payment.status !== "SUCCESS") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="text-center">
					<p className="font-semibold text-2xl text-slate-900">
						Payment not completed
					</p>
					<Link
						href="/dashboard"
						className="mt-4 inline-block font-medium text-blue-600 text-sm hover:underline"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	const handleDownloadPDF = async () => {
		if (!order?.id) return;

		const { toast } = await import("sonner");
		toast.info("Preparing your download...");

		try {
			const blob = await ordersService.downloadTicket(order.id);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `ticket-${order.id.slice(0, 8)}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Download started!");
		} catch (error) {
			console.error(error);
			toast.error("Failed to download PDF. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 py-12 md:py-20">
			<div className="mx-auto max-w-5xl px-6">
				{/* Success Header */}
				<div className="mb-12 text-center">
					<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
						<CheckCircle2 className="h-10 w-10 text-emerald-600" />
					</div>
					<h1 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
						Registration Complete!
					</h1>
					<p className="mx-auto max-w-lg text-slate-600">
						Your ticket has been successfully generated. You can view, download,
						or share your ticket below.
					</p>
				</div>

				{/* Ticket Card */}
				<div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:rounded-3xl">
					<div className="p-6 md:p-8">
						<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
							<div>
								<p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
									Order ID
								</p>
								<p className="font-mono font-semibold text-slate-900">
									{order?.id}
								</p>
							</div>
							<button
								type="button"
								onClick={handleDownloadPDF}
								className="flex items-center gap-2 rounded-lg bg-[#030370] px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-[#030370]/90"
							>
								<Download className="h-4 w-4" />
								Download Ticket
							</button>
						</div>

						<div className="h-px w-full bg-slate-100" />

						{/* Ticket View */}
						{tickets.map((ticket) => (
							<div
								key={ticket.id}
								className="mt-6 rounded-xl bg-[#030370] p-6 text-white md:p-8"
							>
								<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
									<div className="space-y-4">
										<div>
											<p className="mb-1 font-medium text-white/60 text-xs uppercase tracking-wide">
												Event
											</p>
											<p className="font-semibold text-lg">{event?.name}</p>
										</div>
										<div>
											<p className="mb-1 font-medium text-white/60 text-xs uppercase tracking-wide">
												Ticket Type
											</p>
											<p className="font-medium">{ticket.tier?.name}</p>
										</div>
										<div className="flex gap-6">
											<div>
												<p className="mb-1 font-medium text-white/60 text-xs uppercase tracking-wide">
													Attendee
												</p>
												<p className="text-sm">{attendee?.name}</p>
											</div>
											<div>
												<p className="mb-1 font-medium text-white/60 text-xs uppercase tracking-wide">
													Ticket ID
												</p>
												<p className="font-mono text-sm">
													{ticket.id.slice(0, 8)}
												</p>
											</div>
										</div>
									</div>
									{ticket.pass?.code && (
										<div className="h-28 w-28 shrink-0 self-center rounded-lg bg-white p-2 md:self-auto">
											<QRCodeCanvas
												ref={(el) => {
													if (el) qrCodeRefs.current[ticket.id] = el;
												}}
												value={ticket.pass.code}
												size={96}
												level="H"
												includeMargin={false}
												className="h-full w-full"
											/>
										</div>
									)}
								</div>
							</div>
						))}

						<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
									<Mail className="h-4 w-4" />
								</div>
								<div>
									<h4 className="font-medium text-slate-900 text-sm">
										Email Confirmation
									</h4>
									<p className="text-slate-500 text-xs">
										A confirmation has been sent to your email.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
									<Ticket className="h-4 w-4" />
								</div>
								<div>
									<h4 className="font-medium text-slate-900 text-sm">
										Mobile Access
									</h4>
									<p className="text-slate-500 text-xs">
										Show your QR code at the event entrance.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Link
						href="/dashboard/tickets"
						className="flex items-center justify-center gap-2 rounded-xl bg-[#030370] px-6 py-4 font-medium text-white transition-colors hover:bg-[#030370]/90"
					>
						<Ticket className="h-5 w-5" />
						View My Tickets
					</Link>
					<Link
						href="/events"
						className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-medium text-slate-900 transition-colors hover:bg-slate-50"
					>
						Explore More Events
						<ChevronRight className="h-5 w-5" />
					</Link>
				</div>

				{/* Share Section */}
				<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center md:rounded-3xl">
					<h4 className="mb-2 font-semibold text-slate-900">
						Share your excitement
					</h4>
					<p className="mb-4 text-slate-600 text-sm">
						Let your friends know you're attending this event
					</p>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-900 text-sm transition-colors hover:bg-slate-200"
					>
						<Share2 className="h-4 w-4" />
						Share Event
					</button>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-slate-50">
					<div className="text-center">
						<Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-900" />
						<p className="mt-4 font-medium text-slate-600">Loading...</p>
					</div>
				</div>
			}
		>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
