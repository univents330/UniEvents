"use client";

import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { Button } from "@/shared/ui/button";
import { useCreateEvent } from "../hooks/use-events";
import { eventsService } from "../services/events.service";

type TicketTierDraft = {
	name: string;
	price: string;
	quantity: string;
};

function getDefaultTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
	} catch {
		return "Asia/Kolkata";
	}
}

export function CreateEventView() {
	const router = useRouter();
	const createEvent = useCreateEvent();
	const timezone = useMemo(() => getDefaultTimezone(), []);
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
			next[index] = {
				...next[index],
				[field]: value,
			};
			return next;
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			const createdEvent = await createEvent.mutateAsync({
				name: form.name.trim(),
				description: form.description.trim(),
				venueName: form.venueName.trim(),
				address: form.address.trim(),
				coverUrl: form.coverUrl.trim() || "https://picsum.photos/1200/630",
				thumbnail: form.thumbnail.trim() || "https://picsum.photos/600/338",
				latitude: "0",
				longitude: "0",
				timezone,
				startDate: new Date(form.startDate),
				endDate: new Date(form.endDate),
				type: form.type,
				mode: form.mode,
				visibility: form.visibility,
			});

			const validTiers = ticketTiers
				.map((tier) => ({
					name: tier.name.trim(),
					price: Number(tier.price || 0),
					quantity: Number(tier.quantity || 0),
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
						maxQuantity: tier.quantity,
					});
				}
			}

			router.push(`/events/${createdEvent.id}/edit`);
		} catch (submitError) {
			console.error("Failed to create event:", submitError);
			setError(getApiErrorMessage(submitError, "Failed to create the event."));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-4xl">
			<div className="mb-8 flex items-center gap-4">
				<Link
					href="/events"
					className="rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<ArrowLeft className="h-5 w-5 text-slate-600" />
				</Link>
				<div>
					<h1 className="font-bold text-3xl text-slate-900">Create Event</h1>
					<p className="mt-2 text-slate-600">
						Create your event. It will be submitted for admin approval right
						after.
					</p>
				</div>
			</div>

			<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
				<p className="font-semibold">Approval required</p>
				<p className="mt-1 text-amber-800 text-sm">
					Once you create the event, it goes into draft and appears in admin
					approvals. It will be published after approval.
				</p>
			</div>

			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-8 shadow-sm">
				<form className="space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
							{error}
						</div>
					)}

					<Section title="Basic details">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Field label="Event Name" required>
								<input
									required
									value={form.name}
									onChange={(e) => onChange("name", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="Tech Conference 2026"
								/>
							</Field>

							<Field label="Venue Name" required>
								<input
									required
									value={form.venueName}
									onChange={(e) => onChange("venueName", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="Convention Center"
								/>
							</Field>
						</div>

						<Field label="Address" required>
							<input
								required
								value={form.address}
								onChange={(e) => onChange("address", e.target.value)}
								className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								placeholder="City, State"
							/>
						</Field>

						<Field label="Description" required>
							<textarea
								required
								value={form.description}
								onChange={(e) => onChange("description", e.target.value)}
								rows={4}
								className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								placeholder="Describe your event..."
							/>
						</Field>
					</Section>

					<Section title="Schedule and classification">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Field label="Start Date & Time" required>
								<input
									required
									type="datetime-local"
									value={form.startDate}
									onChange={(e) => onChange("startDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>

							<Field label="End Date & Time" required>
								<input
									required
									type="datetime-local"
									value={form.endDate}
									onChange={(e) => onChange("endDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<Field label="Type" required>
								<select
									value={form.type}
									onChange={(e) =>
										onChange("type", e.target.value as "FREE" | "PAID")
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PAID">PAID</option>
									<option value="FREE">FREE</option>
								</select>
							</Field>

							<Field label="Mode" required>
								<select
									value={form.mode}
									onChange={(e) =>
										onChange("mode", e.target.value as "ONLINE" | "OFFLINE")
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="OFFLINE">OFFLINE</option>
									<option value="ONLINE">ONLINE</option>
								</select>
							</Field>

							<Field label="Visibility" required>
								<select
									value={form.visibility}
									onChange={(e) =>
										onChange(
											"visibility",
											e.target.value as "PUBLIC" | "PRIVATE",
										)
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PUBLIC">PUBLIC</option>
									<option value="PRIVATE">PRIVATE</option>
								</select>
							</Field>
						</div>
					</Section>

					<Section title="Media">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Field label="Cover URL (optional)">
								<input
									type="url"
									value={form.coverUrl}
									onChange={(e) => onChange("coverUrl", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="https://..."
								/>
							</Field>

							<Field label="Thumbnail URL (optional)">
								<input
									type="url"
									value={form.thumbnail}
									onChange={(e) => onChange("thumbnail", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="https://..."
								/>
							</Field>
						</div>
					</Section>

					{form.type === "PAID" && (
						<Section title="Ticket Tiers">
							<p className="mb-4 text-slate-600 text-sm">
								Define ticket tiers for your paid event. At least one tier is
								required.
							</p>
							<div className="space-y-4">
								{ticketTiers.map((tier, index) => (
									<div
										key={index}
										className="rounded-lg border border-slate-200 bg-slate-50 p-4"
									>
										<div className="mb-3 flex items-center justify-between">
											<span className="font-semibold text-slate-700 text-sm">
												Tier {index + 1}
											</span>
											{ticketTiers.length > 1 && (
												<button
													type="button"
													onClick={() => removeTier(index)}
													className="text-rose-600 text-sm hover:underline"
												>
													Remove
												</button>
											)}
										</div>
										<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
											<div>
												<label className="font-semibold text-slate-600 text-xs">
													Name
													<input
														type="text"
														value={tier.name}
														onChange={(e) =>
															updateTier(index, "name", e.target.value)
														}
														required
														className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
														placeholder="General Admission"
													/>
												</label>
											</div>
											<div>
												<label className="font-semibold text-slate-600 text-xs">
													Price (₹)
													<input
														type="number"
														value={tier.price}
														onChange={(e) =>
															updateTier(index, "price", e.target.value)
														}
														required
														min="0"
														className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
														placeholder="0"
													/>
												</label>
											</div>
											<div>
												<label className="font-semibold text-slate-600 text-xs">
													Quantity
													<input
														type="number"
														value={tier.quantity}
														onChange={(e) =>
															updateTier(index, "quantity", e.target.value)
														}
														required
														min="1"
														className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
														placeholder="100"
													/>
												</label>
											</div>
										</div>
									</div>
								))}
								<button
									type="button"
									onClick={addTier}
									className="flex items-center gap-2 font-semibold text-[#0a4bb8] text-sm hover:underline"
								>
									<Plus className="h-4 w-4" />
									Add another tier
								</button>
							</div>
						</Section>
					)}

					<div className="flex items-center justify-end gap-3 border-slate-200 border-t pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => router.back()}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-[#0a4bb8] hover:bg-[#0a4bb8]/90"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Event"
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<h3 className="mb-4 font-semibold text-lg text-slate-900">{title}</h3>
			{children}
		</div>
	);
}

function Field({
	label,
	required,
	children,
}: {
	label: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: children contains form controls */}
			<label className="mb-1 block font-medium text-slate-700 text-sm">
				{label}
				{required && <span className="ml-1 text-rose-500">*</span>}
				{children}
			</label>
		</div>
	);
}
