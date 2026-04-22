"use client";

import {
	LayoutDashboard,
	QrCode,
	Search,
	ShieldCheck,
	Users,
} from "lucide-react";
import { cn } from "@/core/lib/cn";

const FEATURES = [
	{
		title: "Discovery",
		description: "Browse the hottest campus events tailored to you.",
		icon: Search,
		color: "text-blue-600",
		bg: "bg-blue-50/50",
		span: "lg:col-span-1",
	},
	{
		title: "Digital Passes",
		description: "Sync your QR tickets and never lose an entry.",
		icon: QrCode,
		color: "text-indigo-600",
		bg: "bg-indigo-50/50",
		span: "lg:col-span-1",
	},
	{
		title: "Real-time Ops",
		description: "Monitor attendance and entry flow as it happens.",
		icon: LayoutDashboard,
		color: "text-emerald-600",
		bg: "bg-emerald-50/50",
		span: "lg:col-span-1",
	},
	{
		title: "Secure Checkout",
		description: "One-tap payments for you and your crew.",
		icon: ShieldCheck,
		color: "text-violet-600",
		bg: "bg-violet-50/50",
		span: "lg:col-span-2",
	},
	{
		title: "Group Savings",
		description: "Unlock discounts when booking for 5+ people.",
		icon: Users,
		color: "text-amber-600",
		bg: "bg-amber-50/50",
		span: "lg:col-span-1",
	},
];

export function FeaturesBento() {
	return (
		<section className="bg-transparent py-20">
			<div className="mx-auto max-w-[1440px] px-6">
				<div className="mb-12 text-center md:text-left">
					<h2 className="mb-4 font-black text-4xl text-slate-900 tracking-tighter md:text-6xl">
						Built for the <span className="text-blue-600">campus life.</span>
					</h2>
					<p className="font-bold text-slate-400 md:text-xl">
						Next-gen tools for event discovery and management.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{FEATURES.map((feature, idx) => (
						<div
							key={idx}
							className={cn(
								"group flex flex-col justify-between rounded-[40px] border border-white/40 bg-white/60 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]",
								feature.span,
							)}
						>
							<div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
								<feature.icon className={feature.color} size={24} />
							</div>

							<div>
								<h3 className="mb-2 font-black text-2xl text-slate-900 tracking-tight">
									{feature.title}
								</h3>
								<p className="font-bold text-slate-400 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
