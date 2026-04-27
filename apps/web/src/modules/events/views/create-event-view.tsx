"use client";

import {
	ArrowLeft,
	Calendar,
	Check,
	ChevronRight,
	Globe,
	Image as ImageIcon,
	Info,
	Loader2,
	MapPin,
	Plus,
	Ticket,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { Button } from "@/shared/ui/button";
import { useCreateEvent } from "../hooks/use-events";
import { eventsService } from "../services/events.service";

type TicketTierDraft = {
	name: string;
	price: string;
	quantity: string;
};

const STEPS = [
	{ id: "basics", title: "Basic Info", icon: <Info size={18} /> },
	{ id: "logistics", title: "When & Where", icon: <MapPin size={18} /> },
	{ id: "media", title: "Media", icon: <ImageIcon size={18} /> },
	{ id: "tickets", title: "Tickets", icon: <Ticket size={18} /> },
];

export function CreateEventView() {
	const router = useRouter();
	const createEvent = useCreateEvent();
	const [activeStep, setActiveStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const [form, setForm] = useState({
		name: "",
		description: "",
		venueName: "",
		address: "",
		startDate: "",
		endDate: "",
		type: "PAID" as "FREE" | "PAID",
		mode: "OFFLINE" as "ONLINE" | "OFFLINE",
		visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
		coverUrl: "",
		thumbnail: "",
	});

	const [ticketTiers, setTicketTiers] = useState<TicketTierDraft[]>([
		{ name: "General Admission", price: "", quantity: "" },
	]);

	const onChange = <K extends keyof typeof form>(
		key: K,
		value: (typeof form)[K],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const addTier = () => {
		setTicketTiers((current) => [
			...current,
			{ name: "", price: "", quantity: "" },
		]);
	};

	const removeTier = (index: number) => {
		setTicketTiers((current) => current.filter((_, i) => i !== index));
	};

	const updateTier = (
		index: number,
		field: keyof TicketTierDraft,
		value: string,
	) => {
		setTicketTiers((current) => {
			const next = [...current];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	};

	const nextStep = () => {
		if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
	};

	const prevStep = () => {
		if (activeStep > 0) setActiveStep(activeStep - 1);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setError("");

		try {
			const createdEvent = await createEvent.mutateAsync({
				...form,
				name: form.name.trim(),
				description: form.description.trim(),
				venueName: form.venueName.trim(),
				address: form.address.trim(),
				coverUrl: form.coverUrl.trim() || "https://picsum.photos/1200/630",
				thumbnail: form.thumbnail.trim() || "https://picsum.photos/600/338",
				latitude: "0",
				longitude: "0",
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
				startDate: new Date(form.startDate),
				endDate: new Date(form.endDate),
			});

			const validTiers = ticketTiers
				.map((tier) => ({
					name: tier.name.trim(),
					price: Math.round(Number(tier.price || 0) * 100),
					quantity: Math.round(Number(tier.quantity || 0)),
				}))
				.filter((tier) => tier.name && tier.quantity > 0);

			if (form.type === "PAID") {
				if (validTiers.length === 0) {
					throw new Error(
						"At least one ticket tier is required for paid events",
					);
				}

				for (const tier of validTiers) {
					await eventsService.createTicketTier(createdEvent.id, {
						name: tier.name,
						description: "Created by host",
						price: tier.price,
						quantity: tier.quantity,
					});
				}
			} else {
				await eventsService.createTicketTier(createdEvent.id, {
					name: "Free Entry",
					description: "Standard free entry",
					price: 0,
					quantity: 1000,
				});
			}

			router.push(`/dashboard/events/${createdEvent.id}`);
		} catch (submitError) {
			setError(getApiErrorMessage(submitError, "Failed to create the event."));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-6xl py-8">
			<div className="mb-10 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link
						href="/dashboard/events"
						className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
					>
						<ArrowLeft className="text-slate-600 transition-transform group-hover:-translate-x-1" />
					</Link>
					<div>
						<h1 className="font-black text-4xl text-slate-900 tracking-tight">
							New Event
						</h1>
						<p className="text-slate-500">Design an experience that wows.</p>
					</div>
				</div>

				<div className="hidden items-center gap-1 rounded-2xl bg-slate-100 p-1 lg:flex">
					{STEPS.map((step, i) => (
						<button
							key={step.id}
							type="button"
							onClick={() => setActiveStep(i)}
							className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm transition-all ${
								activeStep === i
									? "bg-white text-[#030370] shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							<span
								className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] ${
									activeStep >= i
										? "bg-[#030370] text-white"
										: "bg-slate-200 text-slate-400"
								}`}
							>
								{activeStep > i ? <Check size={12} strokeWidth={3} /> : i + 1}
							</span>
							{step.title}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				{/* Main Form Area */}
				<div className="lg:col-span-7">
					<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-slate-200/50 shadow-xl">
						<div className="bg-[#030370] p-6 text-white">
							<div className="flex items-center gap-3">
								<div className="rounded-xl bg-white/10 p-2.5">
									{STEPS[activeStep].icon}
								</div>
								<div>
									<h2 className="font-black text-xl tracking-tight">
										{STEPS[activeStep].title}
									</h2>
									<p className="text-white/60 text-xs">
										Step {activeStep + 1} of {STEPS.length}
									</p>
								</div>
							</div>
						</div>

						<div className="p-8">
							{error && (
								<div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-600">
									<Info size={18} />
									<p className="font-semibold text-sm">{error}</p>
								</div>
							)}

							<div className="space-y-6">
								{activeStep === 0 && (
									<div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500">
										<div className="space-y-2">
											<label
												htmlFor="event-name"
												className="font-bold text-slate-700 text-sm"
											>
												Event Name
											</label>
											<input
												id="event-name"
												value={form.name}
												onChange={(e) => onChange("name", e.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="Enter a catchy name..."
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="description"
												className="font-bold text-slate-700 text-sm"
											>
												Description
											</label>
											<textarea
												id="description"
												rows={5}
												value={form.description}
												onChange={(e) =>
													onChange("description", e.target.value)
												}
												className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="What's this event about?"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<span className="font-bold text-slate-700 text-sm">
													Type
												</span>
												<div className="flex rounded-xl bg-slate-100 p-1">
													{["PAID", "FREE"].map((t) => (
														<button
															key={t}
															type="button"
															onClick={() =>
																onChange("type", t as "PAID" | "FREE")
															}
															className={`flex-1 rounded-lg py-2 font-black text-xs transition-all ${
																form.type === t
																	? "bg-white text-[#030370] shadow-sm"
																	: "text-slate-500"
															}`}
														>
															{t}
														</button>
													))}
												</div>
											</div>
											<div className="space-y-2">
												<span className="font-bold text-slate-700 text-sm">
													Visibility
												</span>
												<div className="flex rounded-xl bg-slate-100 p-1">
													{["PUBLIC", "PRIVATE"].map((v) => (
														<button
															key={v}
															type="button"
															onClick={() =>
																onChange(
																	"visibility",
																	v as "PUBLIC" | "PRIVATE",
																)
															}
															className={`flex-1 rounded-lg py-2 font-black text-xs transition-all ${
																form.visibility === v
																	? "bg-white text-[#030370] shadow-sm"
																	: "text-slate-500"
															}`}
														>
															{v}
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								)}

								{activeStep === 1 && (
									<div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label
													htmlFor="start-date"
													className="font-bold text-slate-700 text-sm"
												>
													Start Date & Time
												</label>
												<input
													id="start-date"
													type="datetime-local"
													value={form.startDate}
													onChange={(e) =>
														onChange("startDate", e.target.value)
													}
													className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												/>
											</div>
											<div className="space-y-2">
												<label
													htmlFor="end-date"
													className="font-bold text-slate-700 text-sm"
												>
													End Date & Time
												</label>
												<input
													id="end-date"
													type="datetime-local"
													value={form.endDate}
													onChange={(e) => onChange("endDate", e.target.value)}
													className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="venue-name"
												className="font-bold text-slate-700 text-sm"
											>
												Venue Name
											</label>
											<input
												id="venue-name"
												value={form.venueName}
												onChange={(e) => onChange("venueName", e.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="e.g. City Convention Hall"
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="address"
												className="font-bold text-slate-700 text-sm"
											>
												Full Address
											</label>
											<input
												id="address"
												value={form.address}
												onChange={(e) => onChange("address", e.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="Street address, City, Zip"
											/>
										</div>
									</div>
								)}

								{activeStep === 2 && (
									<div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500">
										<div className="space-y-2">
											<label
												htmlFor="cover-url"
												className="font-bold text-slate-700 text-sm"
											>
												Cover Image URL
											</label>
											<input
												id="cover-url"
												type="url"
												value={form.coverUrl}
												onChange={(e) => onChange("coverUrl", e.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="https://images.unsplash.com/..."
											/>
											<p className="text-[10px] text-slate-400">
												Recommended size: 1200x630px
											</p>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="thumbnail"
												className="font-bold text-slate-700 text-sm"
											>
												Thumbnail Image URL
											</label>
											<input
												id="thumbnail"
												type="url"
												value={form.thumbnail}
												onChange={(e) => onChange("thumbnail", e.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030370]"
												placeholder="https://images.unsplash.com/..."
											/>
											<p className="text-[10px] text-slate-400">
												Recommended size: 600x600px
											</p>
										</div>
									</div>
								)}

								{activeStep === 3 && (
									<div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500">
										{form.type === "FREE" ? (
											<div className="rounded-3xl border-2 border-slate-200 border-dashed bg-slate-50 p-12 text-center">
												<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#030370] shadow-sm">
													<Globe size={24} />
												</div>
												<h3 className="font-black text-slate-900 text-xl">
													Free Registration
												</h3>
												<p className="mx-auto mt-2 max-w-xs text-slate-500 text-sm">
													A standard "Free Entry" ticket will be created
													automatically. Users can register without payment.
												</p>
											</div>
										) : (
											<div className="space-y-4">
												{ticketTiers.map((tier, i) => (
													<div
														key={i}
														className="group relative rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-all hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-100"
													>
														{ticketTiers.length > 1 && (
															<button
																type="button"
																onClick={() => removeTier(i)}
																className="absolute -top-2 -right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition-transform hover:scale-110"
															>
																<X size={14} strokeWidth={3} />
															</button>
														)}
														<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
															<div className="md:col-span-6">
																<label
																	htmlFor={`tier-name-${i}`}
																	className="mb-1 block font-black text-[10px] text-slate-400 uppercase tracking-widest"
																>
																	Tier Name
																</label>
																<input
																	id={`tier-name-${i}`}
																	value={tier.name}
																	onChange={(e) =>
																		updateTier(i, "name", e.target.value)
																	}
																	className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
																	placeholder="e.g. VIP Access"
																/>
															</div>
															<div className="md:col-span-3">
																<label
																	htmlFor={`tier-price-${i}`}
																	className="mb-1 block font-black text-[10px] text-slate-400 uppercase tracking-widest"
																>
																	Price (₹)
																</label>
																<input
																	id={`tier-price-${i}`}
																	type="number"
																	value={tier.price}
																	onChange={(e) =>
																		updateTier(i, "price", e.target.value)
																	}
																	className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
																	placeholder="0"
																/>
															</div>
															<div className="md:col-span-3">
																<label
																	htmlFor={`tier-qty-${i}`}
																	className="mb-1 block font-black text-[10px] text-slate-400 uppercase tracking-widest"
																>
																	Qty
																</label>
																<input
																	id={`tier-qty-${i}`}
																	type="number"
																	value={tier.quantity}
																	onChange={(e) =>
																		updateTier(i, "quantity", e.target.value)
																	}
																	className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
																	placeholder="100"
																/>
															</div>
														</div>
													</div>
												))}
												<button
													type="button"
													onClick={addTier}
													className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 border-dashed py-4 font-bold text-slate-500 transition-all hover:border-[#030370] hover:bg-[#030370]/5 hover:text-[#030370]"
												>
													<Plus size={18} />
													Add Ticket Tier
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center justify-between border-slate-100 border-t bg-slate-50 p-6">
							<Button
								type="button"
								variant="ghost"
								onClick={prevStep}
								disabled={activeStep === 0 || isSubmitting}
								className="rounded-xl px-6 font-bold text-slate-500 disabled:opacity-0"
							>
								Back
							</Button>

							{activeStep === STEPS.length - 1 ? (
								<Button
									onClick={handleSubmit}
									disabled={isSubmitting || !form.name || !form.startDate}
									className="rounded-xl bg-[#030370] px-8 py-6 font-black text-sm text-white uppercase tracking-widest shadow-[#030370]/20 shadow-xl hover:bg-[#030370]/90 disabled:opacity-50"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 animate-spin" size={18} />
											Creating...
										</>
									) : (
										"Launch Event"
									)}
								</Button>
							) : (
								<Button
									onClick={nextStep}
									className="group rounded-xl bg-[#030370] px-8 py-6 font-black text-sm text-white uppercase tracking-widest shadow-[#030370]/20 shadow-xl hover:bg-[#030370]/90"
								>
									Continue
									<ChevronRight
										className="ml-2 transition-transform group-hover:translate-x-1"
										size={18}
									/>
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Preview Side */}
				<div className="lg:col-span-5">
					<div className="sticky top-8 space-y-6">
						<h3 className="flex items-center gap-2 font-black text-slate-400 text-xs uppercase tracking-widest">
							Live Preview
						</h3>

						<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
							<div className="relative aspect-video overflow-hidden bg-slate-100">
								{form.coverUrl ? (
									<Image
										src={form.coverUrl}
										alt="Cover"
										width={800}
										height={450}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#030370] to-[#0a4bb8] p-8 text-center text-white/20">
										<ImageIcon size={48} strokeWidth={1} />
										<p className="mt-2 font-bold text-xs uppercase tracking-widest">
											No Cover Image
										</p>
									</div>
								)}
								<div className="absolute bottom-6 left-6 flex items-center gap-2">
									<span className="rounded-full bg-white/20 px-3 py-1 font-black text-[10px] text-white uppercase tracking-widest backdrop-blur-md">
										{form.type}
									</span>
									<span className="rounded-full bg-white/20 px-3 py-1 font-black text-[10px] text-white uppercase tracking-widest backdrop-blur-md">
										{form.mode}
									</span>
								</div>
							</div>

							<div className="p-8">
								<h2 className="line-clamp-2 font-black text-2xl text-slate-900 tracking-tight">
									{form.name || "Event Title"}
								</h2>
								<p className="mt-3 line-clamp-3 text-slate-500 text-sm leading-relaxed">
									{form.description || "Describe your event to see it here..."}
								</p>

								<div className="mt-8 space-y-4 border-slate-100 border-t pt-8">
									<div className="flex items-center gap-3 text-slate-600">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
											<Calendar className="text-[#030370]" size={18} />
										</div>
										<div>
											<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
												Date & Time
											</p>
											<p className="font-bold text-sm">
												{form.startDate
													? new Date(form.startDate).toLocaleString("en-IN", {
															dateStyle: "medium",
															timeStyle: "short",
														})
													: "TBD"}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3 text-slate-600">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
											<MapPin className="text-[#030370]" size={18} />
										</div>
										<div>
											<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
												Location
											</p>
											<p className="font-bold text-sm">
												{form.venueName || "TBD"}
												{form.address && (
													<span className="block font-normal text-slate-400 text-xs">
														{form.address}
													</span>
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6">
							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
									<Info size={20} />
								</div>
								<div>
									<h4 className="font-black text-amber-900 text-sm">
										Admin Approval
									</h4>
									<p className="mt-1 text-amber-800/70 text-xs leading-relaxed">
										New events are reviewed by our team. Your event will be in
										<strong> Draft</strong> mode until approved.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
