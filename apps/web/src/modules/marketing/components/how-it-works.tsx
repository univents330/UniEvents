"use client";

import {
	CheckCircle2,
	CreditCard,
	Search,
	Sparkles,
	Ticket,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/cn";

const STEPS = [
	{
		id: 1,
		number: "01",
		title: "Discover Nearby",
		description:
			"Browse the hottest campus events tailored to your interests. From tech workshops to rooftop mixers, find your next core memory.",
		icon: Search,
	},
	{
		id: 2,
		number: "02",
		title: "Reserve Instantly",
		description:
			"Skip the queues. Choose your spot and secure your tickets with our ultra-secure, one-tap checkout system.",
		icon: Ticket,
	},
	{
		id: 3,
		number: "03",
		title: "Digital Delivery",
		description:
			"No paper, no fuss. Your premium pass is delivered instantly to your device, synced and ready for the big day.",
		icon: CreditCard,
	},
	{
		id: 4,
		number: "04",
		title: "VIP Entry",
		description:
			"Walk right in. Just flash your unique QR code at the gate and let our high-speed scanners do the rest.",
		icon: Sparkles,
	},
];

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(1);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			const totalHeight = rect.height - windowHeight;
			const scrolled = -rect.top;

			if (scrolled < 0) {
				setActiveStep(1);
				return;
			}

			const progress = Math.max(
				0,
				Math.min(100, (scrolled / totalHeight) * 100),
			);
			const stepIndex = Math.min(
				STEPS.length,
				Math.floor((progress / 100) * STEPS.length) + 1,
			);
			setActiveStep(stepIndex || 1);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<section
			ref={containerRef}
			className="relative h-[400vh] w-full bg-transparent"
		>
			<div className="sticky top-0 flex h-screen min-h-screen w-full items-center overflow-hidden">
				<div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-start px-6 pt-32 lg:flex-row lg:items-center lg:justify-between lg:gap-24 lg:pt-0">
					{/* Left Side: Text Column */}
					<div className="relative z-10 flex w-full flex-col justify-center text-center lg:w-[45%] lg:text-left">
						{/* Step Header Row - Hidden on mobile */}
						<div className="mb-12 hidden items-center gap-4 lg:flex">
							{STEPS.map((step) => (
								<div
									key={step.id}
									className={cn(
										"flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-700",
										activeStep === step.id
											? "scale-110 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-200"
											: "scale-90 bg-slate-50 text-slate-300",
									)}
								>
									<span className="font-black text-xl">{step.number}</span>
								</div>
							))}
						</div>

						{/* Sliding Titles and Descriptions - Grand Scale */}
						<div className="relative overflow-hidden">
							<div
								className="cubic-bezier(0.16, 1, 0.3, 1) flex transition-transform duration-700 will-change-transform"
								style={{ transform: `translateX(-${(activeStep - 1) * 100}%)` }}
							>
								{STEPS.map((step) => (
									<div key={step.id} className="w-full shrink-0 pr-0 lg:pr-12">
										<h3 className="mb-6 font-black text-5xl text-slate-900 tracking-tighter sm:text-6xl md:text-8xl">
											{step.title.split(" ")[0]}
											<br />
											<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
												{step.title.split(" ")[1] || ""}
											</span>
										</h3>
										<p className="mx-auto max-w-md font-bold text-lg text-slate-400 leading-relaxed md:text-2xl lg:mx-0">
											{step.description}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Side: Sticky Visual - Tightened Gap */}
					<div className="relative mt-4 flex w-full flex-1 translate-y-8 items-center justify-center lg:mt-0 lg:w-[50%] lg:translate-y-0">
						<div className="relative aspect-[9/19.5] w-full max-w-[280px] rounded-[50px] bg-slate-950 p-2.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-slate-800 md:max-w-[320px] md:rounded-[60px] md:p-3">
							{/* Screen Container */}
							<div className="relative h-full w-full overflow-hidden rounded-[40px] bg-slate-50 md:rounded-[48px]">
								<div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-30" />
								<div className="absolute top-4 left-1/2 z-30 h-6 w-20 -translate-x-1/2 rounded-full bg-slate-950" />

								{/* Step 1: Discover */}
								<div
									className={cn(
										"absolute inset-0 p-6 pt-16 transition-all duration-1000",
										activeStep === 1
											? "scale-100 opacity-100"
											: "scale-95 opacity-0",
									)}
								>
									<div className="mb-6 flex h-11 items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
										<Search size={18} className="text-slate-400" />
										<div className="h-1.5 w-32 rounded-full bg-slate-100" />
									</div>
									<div className="space-y-4">
										{[
											{ t: "Tech Expo" },
											{ t: "Rooftop Mixer" },
											{ t: "AI Workshop" },
											{ t: "Jazz Night" },
										].map((_ev, i) => (
											<div
												key={i}
												className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
											>
												<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50/50">
													<div className="h-8 w-8 rounded-lg bg-blue-100/50" />
												</div>
												<div className="flex-1 pt-1">
													<div className="mb-2 h-3 w-3/4 rounded-full bg-slate-900/5" />
													<div className="flex gap-2">
														<div className="h-1.5 w-12 rounded-full bg-slate-100" />
														<div className="h-1.5 w-8 rounded-full bg-blue-100" />
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Step 2: Reserve */}
								<div
									className={cn(
										"absolute inset-0 p-8 pt-16 transition-all duration-1000",
										activeStep === 2
											? "translate-y-0 opacity-100"
											: "translate-y-20 opacity-0",
									)}
								>
									<div className="relative mb-8 flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl">
										<div className="z-10 text-center">
											<p className="font-black text-[10px] uppercase tracking-widest opacity-70">
												Secure Ticket
											</p>
											<h4 className="font-black text-2xl">Confirm?</h4>
										</div>
									</div>
									<div className="space-y-4">
										<div className="rounded-3xl border-2 border-indigo-600 bg-white p-6 shadow-lg">
											<div className="mb-4 flex items-center justify-between">
												<div className="h-4 w-24 rounded-full bg-indigo-600/10" />
												<span className="font-black text-indigo-600 text-xs">
													$45.00
												</span>
											</div>
											<div className="space-y-2">
												<div className="h-1.5 w-full rounded-full bg-slate-50" />
												<div className="h-1.5 w-2/3 rounded-full bg-slate-50" />
											</div>
										</div>
										<div className="flex h-14 w-full items-center justify-center gap-3 rounded-3xl bg-slate-900 font-black text-sm text-white">
											Pay with Card
										</div>
									</div>
								</div>

								{/* Step 3: Delivery */}
								<div
									className={cn(
										"absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000",
										activeStep === 3
											? "scale-100 opacity-100"
											: "scale-90 opacity-0",
									)}
								>
									<div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-50 text-emerald-500 shadow-2xl">
										<CheckCircle2 size={48} />
									</div>
									<h4 className="mb-2 font-black text-3xl text-slate-900">
										Success!
									</h4>
									<p className="mb-10 font-black text-[11px] text-slate-400 uppercase tracking-[0.3em]">
										Pass Generated
									</p>
									<div className="w-full space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
										<div className="flex items-center justify-between">
											<div className="h-2 w-16 rounded-full bg-slate-100" />
											<div className="h-2 w-12 rounded-full bg-slate-200" />
										</div>
										<div className="flex items-center justify-between">
											<div className="h-2 w-20 rounded-full bg-slate-100" />
											<div className="h-2 w-16 rounded-full bg-slate-200" />
										</div>
									</div>
								</div>

								{/* Step 4: VIP Pass */}
								<div
									className={cn(
										"absolute inset-0 p-6 pt-20 transition-all duration-1000",
										activeStep === 4
											? "scale-100 opacity-100"
											: "scale-95 opacity-0",
									)}
								>
									<div className="relative flex aspect-square w-full items-center justify-center rounded-[48px] border border-slate-100 bg-white p-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)]">
										<div className="h-full w-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=UniEvents_VIP_PASS')] bg-cover opacity-90" />
									</div>
									<div className="mt-12 text-center">
										<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 font-black text-[10px] text-white uppercase tracking-widest shadow-blue-100 shadow-lg">
											VIP GATE PASS
										</div>
										<h4 className="mb-1 font-black text-3xl text-slate-900">
											Gate 04
										</h4>
										<p className="font-bold text-slate-400 text-xs">
											Section A • Row 12
										</p>
									</div>
								</div>

								<div className="absolute bottom-6 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-slate-200" />
							</div>

							<div className="absolute top-40 -right-1 h-14 w-1.5 rounded-l-full bg-slate-900" />
							<div className="absolute top-64 -right-1 h-24 w-1.5 rounded-l-full bg-slate-900" />
							<div className="absolute top-52 -left-1 h-20 w-1.5 rounded-r-full bg-slate-900" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
