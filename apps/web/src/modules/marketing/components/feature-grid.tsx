"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/core/lib/cn";

const STEPS = [
	{
		id: 1,
		title: "Discovery",
		description:
			"Attendees can scan the full event lineup, then filter by category, mode, and seat availability.",
	},
	{
		id: 2,
		title: "Registration",
		description:
			"Every event detail view provides clear schedule, audience, and CTA paths into ticket reservation.",
	},
	{
		id: 3,
		title: "Mobile Passes",
		description:
			"Ticket Hub centralizes active, used, and expired passes with real-time style status visibility.",
	},
	{
		id: 4,
		title: "Operations",
		description:
			"Dashboard cards summarize event inventory and pass readiness for faster event-day decisions.",
	},
];

export function FeatureGrid() {
	const [activeStep, setActiveStep] = useState(1);

	return (
		<div className="mx-auto max-w-7xl px-6">
			<div className="flex flex-col items-start gap-16 lg:flex-row lg:gap-24">
				<div className="w-full max-w-2xl flex-1">
					<div className="mb-8 flex items-center gap-4">
						<div className="h-0.5 w-8 bg-[#080880]/40" />
						<span className="font-bold text-[#080880] text-xs uppercase tracking-widest">
							Platform Highlights
						</span>
						<div className="h-0.5 max-w-105 flex-1 bg-[#080880]/40" />
					</div>

					<h2 className="mb-6 font-black text-5xl text-[#1e293b] tracking-tight md:text-6xl">
						Everything attendees and organizers need in{" "}
						<span className="text-[#1010a3]">one flow</span>
					</h2>

					<p className="mb-16 font-semibold text-[#64748b] text-[17px]">
						The experience is now fully wired at the frontend layer: discovery,
						event detail, ticket management, and operational visibility.
					</p>

					<div className="flex flex-col gap-10">
						{STEPS.map((step) => {
							const isActive = step.id === activeStep;
							return (
								<button
									type="button"
									key={step.id}
									onClick={() => setActiveStep(step.id)}
									className="group flex w-full items-center gap-8 text-left lg:gap-10"
								>
									<div className="relative">
										{isActive && (
											<div className="absolute top-1/2 -left-6 h-15 w-1.5 -translate-y-1/2 rounded-full bg-[#2563EB] lg:-left-8" />
										)}
										<div
											className={cn(
												"flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] font-black text-5xl transition-all duration-300",
												isActive
													? "bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(41,98,255,0.4)]"
													: "bg-[#e5ecf6] text-[#9ca3af] shadow-[0_12px_40px_rgba(20,40,70,0.06)] group-hover:bg-[#dfe7f3] group-hover:shadow-[0_16px_40px_rgba(41,98,255,0.1)]",
											)}
										>
											{step.id}
										</div>
									</div>
									<div className="flex-1 pt-2">
										<h3 className="mb-2 font-bold text-[#1e293b] text-[20px]">
											{step.title}
										</h3>
										<p className="max-w-110 font-medium text-[#64748b] text-[16px] leading-relaxed">
											{step.description}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				<div className="sticky top-24 hidden items-center justify-center pt-12 lg:flex lg:w-[45%] xl:w-[50%]">
					<div className="relative w-85 rounded-[50px] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
						<Image
							src="/assets/iphone.webp"
							alt="iPhone Mockup"
							width={680}
							height={1380}
							className="h-auto w-full rounded-[50px]"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
