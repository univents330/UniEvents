"use client";

import { ArrowLeft, Loader2, Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { eventsService, useCreateEvent } from "../../../../../features/events";
import { showNotification } from "../../../../../shared/lib/notifications";

function getDefaultTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
	} catch {
		return "Asia/Kolkata";
	}
}

export default function CreateEventPage() {
	const router = useRouter();
	const createEvent = useCreateEvent();
	const timezone = useMemo(() => getDefaultTimezone(), []);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
		ticketTierName: "General Admission",
		ticketTierPrice: "",
		ticketTierQuantity: "",
	});

	const onChange = <K extends keyof typeof form>(
		key: K,
		value: (typeof form)[K],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

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

			if (createdEvent?.id) {
				const tierPrice = Number(form.ticketTierPrice || 0);
				const tierQuantity = Number(form.ticketTierQuantity || 0);

				if (form.type === "PAID" && tierPrice > 0 && tierQuantity > 0) {
					await eventsService.createTicketTier(createdEvent.id, {
						name: form.ticketTierName.trim() || "General Admission",
						description: "Default ticket tier",
						price: tierPrice,
						maxQuantity: tierQuantity,
					});
				}

				showNotification({
					title: "Event sent for approval",
					message:
						"Your event was created as a draft and is waiting for review.",
					color: "blue",
				});

				router.push("/host/requests" as Route);
			}
		} catch {
			showNotification({
				title: "Could not create event",
				message: "Please review the form and try again.",
				color: "red",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-4xl">
			<div className="mb-8 flex items-center gap-4">
				<Link
					href={"/host/events" as Route}
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

					<Section title="Ticket pricing">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<Field label="Ticket Tier Name">
								<input
									value={form.ticketTierName}
									onChange={(e) => onChange("ticketTierName", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="General Admission"
								/>
							</Field>

							<Field label="Ticket Price (INR)">
								<input
									value={form.ticketTierPrice}
									onChange={(e) => onChange("ticketTierPrice", e.target.value)}
									type="number"
									min="0"
									step="1"
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="1500"
								/>
							</Field>

							<Field label="Quantity">
								<input
									value={form.ticketTierQuantity}
									onChange={(e) =>
										onChange("ticketTierQuantity", e.target.value)
									}
									type="number"
									min="1"
									step="1"
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
									placeholder="100"
								/>
							</Field>
						</div>

						<p className="text-slate-500 text-sm">
							Ticket amount is stored in the backend as a tier price. For paid
							events, create at least one tier.
						</p>
					</Section>

					<div className="flex gap-4 pt-4">
						<Link
							href={"/host/events" as Route}
							className="flex-1 rounded-lg bg-slate-100 px-6 py-3 text-center font-medium text-slate-900 hover:bg-slate-200"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 rounded-lg bg-[#0a4bb8] px-6 py-3 font-medium text-white hover:bg-[#0a4bb8]/90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Creating...
								</span>
							) : (
								<span className="inline-flex items-center gap-2">
									<Plus className="h-4 w-4" />
									Create Event
								</span>
							)}
						</button>
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
		<div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] p-6">
			<h2 className="mb-6 font-semibold text-lg text-slate-900">{title}</h2>
			<div className="space-y-6">{children}</div>
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
			<p className="mb-2 block font-medium text-slate-900 text-sm">
				{label} {required ? <span className="text-rose-500">*</span> : null}
			</p>
			{children}
		</div>
	);
}
