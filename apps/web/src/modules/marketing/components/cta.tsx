"use client";

import {
	ArrowRight,
	Bell,
	MessageSquare,
	ShieldCheck,
	XCircle,
	Zap,
} from "lucide-react";
import { cn } from "@/core/lib/cn";

export function CTA() {
	return (
		<section className="overflow-hidden bg-transparent py-24">
			<div className="mx-auto max-w-[1440px] px-6">
				{/* Rich Opaque Group Booking Card */}
				<div className="relative mb-24 overflow-hidden rounded-[60px] bg-blue-700 p-10 text-white shadow-2xl shadow-blue-200 md:p-20">
					<div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />

					<div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl text-center lg:text-left">
							<div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 font-black text-[10px] text-white uppercase tracking-[0.2em]">
								Group Booking
							</div>

							<h2 className="mb-4 font-black text-5xl leading-[1.1] tracking-tighter md:text-7xl">
								Coming with your crew?
								<br />
								<span className="text-blue-200">Save more together.</span>
							</h2>

							<p className="mb-10 max-w-xl font-bold text-blue-100/60 text-lg leading-relaxed md:text-xl">
								Book 5+ Tickets In A Single Transaction And Unlock Automatic
								Discounts. Everyone Gets Their Own QR Pass Instantly.
							</p>

							<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:items-start lg:justify-start">
								<button
									type="button"
									className="flex h-14 items-center justify-center gap-3 rounded-full bg-white px-10 font-black text-blue-700 shadow-xl transition-all hover:scale-105 active:scale-95"
								>
									Book Now <ArrowRight size={18} />
								</button>
								<button
									type="button"
									className="flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 font-black text-white transition-all hover:bg-white/10 active:scale-95"
								>
									Learn More
								</button>
							</div>
						</div>

						<div className="hidden items-center justify-center lg:flex">
							<div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/10">
								<div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border-2 border-white/20 border-dashed" />
								<span className="font-black text-4xl text-white">20%</span>
							</div>
						</div>
					</div>
				</div>

				{/* Features Row */}
				<div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 pt-8">
					{[
						{
							icon: ShieldCheck,
							text: "Secure Payments",
							color: "text-blue-600",
						},
						{
							icon: MessageSquare,
							text: "WhatsApp Delivery",
							color: "text-emerald-600",
						},
						{ icon: Zap, text: "Instant QR Pass", color: "text-amber-600" },
						{ icon: Bell, text: "Event reminders", color: "text-orange-600" },
						{
							icon: XCircle,
							text: "Easy Cancellation",
							color: "text-slate-400",
						},
					].map((item, i) => (
						<div
							key={i}
							className="group flex items-center gap-3 transition-all"
						>
							<item.icon
								size={20}
								className={cn(
									item.color,
									"transition-transform group-hover:scale-110",
								)}
							/>
							<span className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em]">
								{item.text}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
