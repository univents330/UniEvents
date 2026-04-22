"use client";

import {
	CheckCircle2,
	ChevronRight,
	Download,
	Mail,
	Printer,
	Share2,
	ShieldCheck,
	Smartphone,
	Ticket,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useCart } from "@/core/providers/cart-provider";

export default function CheckoutSuccessPage() {
	const { clearCart } = useCart();
	const [orderId] = useState(
		() =>
			`ORD-${Math.floor(Math.random() * 100000)
				.toString()
				.padStart(5, "0")}`,
	);

	useEffect(() => {
		// Clear the cart on successful order
		clearCart();
	}, [clearCart]);

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#fcfcfc] pt-24 pb-32 font-jakarta text-[#000031]">
			{/* Structural Background */}
			<div className="absolute top-0 left-0 h-1 w-full bg-[#000031]" />
			<div className="pointer-events-none absolute top-0 right-0 h-screen w-1/3 border-slate-100 border-l bg-slate-50/50" />

			<div className="relative z-10 mx-auto max-w-7xl px-6">
				<div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
					{/* Main Confirmation Area */}
					<div className="space-y-12 lg:col-span-7">
						{/* Status Header */}
						<div className="space-y-6">
							<div className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-600 shadow-sm">
								<ShieldCheck size={14} strokeWidth={3} />
								<span className="font-black text-[10px] uppercase tracking-[0.2em]">
									Transaction Protocol Verified
								</span>
							</div>

							<div className="space-y-2">
								<h1 className="font-black text-6xl leading-[0.85] tracking-tighter">
									REGISTRATION <br />
									<span className="text-slate-300">COMPLETE.</span>
								</h1>
								<p className="max-w-xl font-medium text-lg text-slate-500 leading-relaxed">
									The system has finalized your allocation. Your digital access
									keys are now active and available for sync with your mobile
									device.
								</p>
							</div>
						</div>

						{/* Ticket Manifest Card */}
						<div className="group overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
							<div className="space-y-10 p-8 lg:p-12">
								<div className="flex flex-wrap items-end justify-between gap-6">
									<div className="space-y-1">
										<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
											Order Identifier
										</p>
										<p className="font-black font-mono text-3xl">{orderId}</p>
									</div>
									<div className="flex gap-2">
										<button
											type="button"
											className="flex h-10 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white"
										>
											<Download size={14} /> PDF Ticket
										</button>
										<button
											type="button"
											className="flex h-10 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white"
										>
											<Printer size={14} /> Print
										</button>
									</div>
								</div>

								<div className="h-px w-full bg-slate-100" />

								{/* Simulated Ticket View */}
								<div className="relative overflow-hidden rounded-[32px] bg-[#000031] p-8 text-white">
									{/* Decorative "Punch Hole" */}
									<div className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fcfcfc]" />
									<div className="absolute top-1/2 -right-4 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fcfcfc]" />
									<div className="absolute top-1/2 right-8 left-8 -translate-y-1/2 border-white/20 border-t border-dashed" />

									<div className="relative z-10 flex flex-col justify-between gap-12 md:flex-row">
										<div className="space-y-6">
											<div>
												<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
													Pass Category
												</p>
												<p className="font-bold text-xl tracking-tight">
													Full-Experience Access
												</p>
											</div>
											<div className="flex gap-8">
												<div>
													<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
														Check-in
													</p>
													<p className="font-bold text-xs uppercase tracking-widest">
														Gate Alpha
													</p>
												</div>
												<div>
													<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
														Arrival
													</p>
													<p className="font-bold text-xs uppercase tracking-widest">
														15 Mins Early
													</p>
												</div>
											</div>
										</div>
										<div className="h-32 w-32 shrink-0 self-center rounded-2xl bg-white p-2 md:self-auto">
											{/* Placeholder for QR Code UI */}
											<div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-slate-200 border-dashed bg-slate-100">
												<Smartphone size={24} className="text-slate-300" />
											</div>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
											<Mail size={18} />
										</div>
										<div>
											<h4 className="font-bold text-sm">Email Dispatch</h4>
											<p className="text-slate-500 text-xs leading-relaxed">
												A confirmation node has been sent to your primary
												mailbox.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
											<Smartphone size={18} />
										</div>
										<div>
											<h4 className="font-bold text-sm">Mobile Sync</h4>
											<p className="text-slate-500 text-xs leading-relaxed">
												Use the UniEvent Mobile app for live entry protocol.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Side Content / Lifecycle */}
					<div className="space-y-12 lg:col-span-5">
						{/* Registration Lifecycle */}
						<div className="space-y-8 pt-4">
							<h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.3em]">
								Registration Lifecycle
							</h3>

							<div className="relative space-y-10">
								<div className="absolute top-2 bottom-2 left-4 w-px bg-slate-100" />

								{[
									{
										title: "Booking Received",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Payment Verified",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Identity Validated",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Ticket Generated",
										status: "Ready",
										icon: Ticket,
										active: false,
									},
								].map((step, i) => (
									<div key={i} className="relative flex gap-6">
										<div
											className={cn(
												"z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
												step.active
													? "bg-emerald-500 text-white"
													: "border border-slate-200 bg-white text-slate-300",
											)}
										>
											<step.icon size={14} strokeWidth={3} />
										</div>
										<div className="space-y-1">
											<p className="font-black text-sm uppercase tracking-widest">
												{step.title}
											</p>
											<p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
												{step.status}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Quick Actions */}
						<div className="space-y-6 rounded-[40px] border border-slate-100 bg-slate-50 p-8">
							<h3 className="font-black text-sm uppercase tracking-widest">
								Next Operations
							</h3>
							<div className="space-y-3">
								<Link
									href="/dashboard/tickets"
									className="!text-white flex h-14 w-full items-center justify-between rounded-2xl bg-[#000031] px-6 transition-all hover:scale-[1.02] active:scale-95"
								>
									<span className="font-black text-[10px] uppercase tracking-widest">
										Go to Dashboard
									</span>
									<ChevronRight size={16} />
								</Link>
								<Link
									href="/discover"
									className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 text-[#000031] transition-all hover:bg-slate-50"
								>
									<span className="font-black text-[10px] uppercase tracking-widest">
										Explore More Events
									</span>
									<ChevronRight size={16} />
								</Link>
							</div>
							<p className="text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest">
								Support Code: UE-CONF-2024
							</p>
						</div>

						{/* Community Shoutout */}
						<div className="group relative cursor-pointer overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-blue-600/20 shadow-xl">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
							<div className="relative z-10 space-y-4">
								<h4 className="font-black text-xl leading-tight">
									Share the hype.
								</h4>
								<p className="font-medium text-white/70 text-xs leading-relaxed">
									Let your circle know you're headed to the most anticipated
									event on campus.
								</p>
								<div className="flex gap-2 pt-2">
									<button
										type="button"
										className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-6 font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-white/20"
									>
										<Share2 size={12} /> Share Now
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
