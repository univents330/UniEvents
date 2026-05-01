import { Bell, MessageCircle, ShieldCheck, Undo2, Zap } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function FinalCTA() {
	return (
		<section className="w-full border-slate-100 border-t bg-[#EBF3FF] py-24">
			<div className="mx-auto max-w-[1280px] px-6 text-center">
				<h2 className="mx-auto mb-8 max-w-4xl font-extrabold text-4xl text-black leading-tight tracking-tighter md:text-7xl">
					Your next unforgettable{" "}
					<span className="text-[#06069A]">experience is out there.</span>
				</h2>

				<p className="mx-auto mb-12 max-w-3xl font-semibold text-lg text-slate-400 leading-relaxed md:text-2xl">
					Join 85,000+ attendees who discover and book events on UniEvent every
					month. Free to join, free to explore.
				</p>

				<div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button
						asChild
						size="lg"
						className="h-16 rounded-full bg-[#030370] px-12 font-bold text-white text-xl shadow-xl transition-all hover:bg-[#030370]/90 active:scale-95"
					>
						<Link href="/events">Browse Events</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="h-16 rounded-full border-slate-200 bg-white px-12 font-bold text-slate-600 text-xl transition-all hover:border-[#030370] hover:text-[#030370] active:scale-95"
					>
						<Link href={"/dashboard/events/create" as Route}>
							Create Free Events
						</Link>
					</Button>
				</div>

				<div className="mx-auto max-w-4xl">
					<div className="mb-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
						<div className="flex items-center gap-2 font-bold text-base text-slate-500">
							<ShieldCheck className="h-5 w-5 text-blue-500" /> Secure Payments
						</div>
						<div className="flex items-center gap-2 font-bold text-base text-slate-500">
							<MessageCircle className="h-5 w-5 text-green-500" /> WhatsApp
							Delivery
						</div>
						<div className="flex items-center gap-2 font-bold text-base text-slate-500">
							<Zap className="h-5 w-5 fill-yellow-500 text-yellow-500" />{" "}
							Instant QR Pass
						</div>
						<div className="flex items-center gap-2 font-bold text-base text-slate-500">
							<Bell className="h-5 w-5 text-amber-500" /> Event reminders
						</div>
					</div>
					<div className="flex items-center justify-center">
						<div className="flex items-center gap-2 font-bold text-base text-slate-500">
							<Undo2 className="h-5 w-5 text-[#030370]" /> Easy Cancellation
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
