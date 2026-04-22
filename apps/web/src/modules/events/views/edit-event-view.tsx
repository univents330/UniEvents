"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import {
	useEvent,
	useEventTicketTiers,
	useUpdateEvent,
} from "../hooks/use-events";
import { eventsService } from "../services/events.service";

function toDateTimeLocal(date: string | Date) {
	const d = new Date(date);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EventFormState = {
	name: string;
	description: string;
	venueName: string;
	address: string;
	startDate: string;
	endDate: string;
	type: "FREE" | "PAID";
	mode: "ONLINE" | "OFFLINE";
	visibility: "PUBLIC" | "PRIVATE";
	status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
	coverUrl: string;
	thumbnail: string;
};

export function EditEventView({ eventId }: { eventId: string }) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const eventQuery = useEvent(eventId);
	const tiersQuery = useEventTicketTiers(eventId);
	const updateEvent = useUpdateEvent(eventId);

	const [form, setForm] = useState<EventFormState | null>(null);
	const [isSavingTiers, setIsSavingTiers] = useState(false);
	const [newTier, setNewTier] = useState({
		name: "",
		price: "",
		maxQuantity: "",
	});
	const [tierDrafts, setTierDrafts] = useState<
		Record<string, { name: string; price: string; maxQuantity: string }>
	>({});

	useEffect(() => {
		const event = eventQuery.data;
		if (!event) return;

		setForm({
			name: event.name,
			description: event.description,
			venueName: event.venueName,
			address: event.address,
			startDate: toDateTimeLocal(event.startDate),
			endDate: toDateTimeLocal(event.endDate),
			type: event.type,
			mode: event.mode,
			visibility: event.visibility,
			status: event.status,
			coverUrl: event.coverUrl,
			thumbnail: event.thumbnail,
		});
	}, [eventQuery.data]);

	useEffect(() => {
		const tiers = tiersQuery.data?.data ?? [];
		setTierDrafts((current) => {
			const next = { ...current };
			for (const tier of tiers) {
				next[tier.id] = {
					name: current[tier.id]?.name ?? tier.name,
					price: current[tier.id]?.price ?? String(tier.price),
					maxQuantity:
						current[tier.id]?.maxQuantity ?? String(tier.maxQuantity),
				};
			}
			return next;
		});
	}, [tiersQuery.data?.data]);

	const isDirty = useMemo(() => {
		const event = eventQuery.data;
		if (!event || !form) return false;

		return (
			form.name !== event.name ||
			form.description !== event.description ||
			form.venueName !== event.venueName ||
			form.address !== event.address ||
			new Date(form.startDate).getTime() !==
				new Date(event.startDate).getTime() ||
			new Date(form.endDate).getTime() !== new Date(event.endDate).getTime() ||
			form.type !== event.type ||
			form.mode !== event.mode ||
			form.visibility !== event.visibility ||
			form.status !== event.status ||
			form.coverUrl !== event.coverUrl ||
			form.thumbnail !== event.thumbnail
		);
	}, [eventQuery.data, form]);

	const onChange = <K extends keyof EventFormState>(
		key: K,
		value: EventFormState[K],
	) => {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!form || !eventId) return;

		await updateEvent.mutateAsync({
			name: form.name.trim(),
			description: form.description.trim(),
			venueName: form.venueName.trim(),
			address: form.address.trim(),
			startDate: new Date(form.startDate),
			endDate: new Date(form.endDate),
			type: form.type,
			mode: form.mode,
			visibility: form.visibility,
			status: form.status,
			coverUrl: form.coverUrl.trim() || "https://picsum.photos/1200/630",
			thumbnail: form.thumbnail.trim() || "https://picsum.photos/600/338",
		});

		router.push("/events");
	};

	const invalidateTierData = async () => {
		await queryClient.invalidateQueries({ queryKey: ["events"] });
	};

	const handleCreateTier = async () => {
		if (!eventId || !newTier.name.trim() || Number(newTier.maxQuantity) <= 0) {
			return;
		}

		setIsSavingTiers(true);
		try {
			await eventsService.createTicketTier(eventId, {
				name: newTier.name.trim(),
				description: "Updated by host",
				price: Number(newTier.price || 0),
				maxQuantity: Number(newTier.maxQuantity),
			});

			setNewTier({ name: "", price: "", maxQuantity: "" });
			await invalidateTierData();
		} finally {
			setIsSavingTiers(false);
		}
	};

	const handleSaveTier = async (tierId: string) => {
		if (!eventId) {
			return;
		}

		const draft = tierDrafts[tierId];
		if (!draft?.name.trim() || Number(draft.maxQuantity) <= 0) {
			return;
		}

		setIsSavingTiers(true);
		try {
			await eventsService.updateTicketTier(eventId, tierId, {
				name: draft.name.trim(),
				price: Number(draft.price || 0),
				maxQuantity: Number(draft.maxQuantity),
			});
			await invalidateTierData();
		} finally {
			setIsSavingTiers(false);
		}
	};

	const handleDeleteTier = async (tierId: string) => {
		if (!eventId) {
			return;
		}

		setIsSavingTiers(true);
		try {
			await eventsService.deleteTicketTier(eventId, tierId);
			await invalidateTierData();
		} finally {
			setIsSavingTiers(false);
		}
	};

	if (eventQuery.isLoading || !form) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				{eventQuery.isLoading
					? "Loading event details..."
					: "Initializing form..."}
			</div>
		);
	}

	if (eventQuery.isError) {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
				Failed to load event details.{" "}
				{getApiErrorMessage(eventQuery.error, "Please try again.")}
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center gap-4">
				<Link
					href="/events"
					className="rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<ArrowLeft className="h-5 w-5 text-slate-600" />
				</Link>
				<div>
					<h1 className="font-black text-3xl text-slate-900 tracking-tight">
						Edit Event
					</h1>
					<p className="mt-1 text-slate-600">
						Update event details and publishing state.
					</p>
				</div>
			</div>

			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
				<form className="space-y-6" onSubmit={handleSubmit}>
					<Section title="Event details">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Event name" required>
								<input
									required
									value={form.name}
									onChange={(e) => onChange("name", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="Venue" required>
								<input
									required
									value={form.venueName}
									onChange={(e) => onChange("venueName", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>

						<Field label="Address" required>
							<input
								required
								value={form.address}
								onChange={(e) => onChange("address", e.target.value)}
								className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							/>
						</Field>

						<Field label="Description" required>
							<textarea
								required
								rows={4}
								value={form.description}
								onChange={(e) => onChange("description", e.target.value)}
								className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							/>
						</Field>
					</Section>

					<Section title="Schedule and settings">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Start" required>
								<input
									required
									type="datetime-local"
									value={form.startDate}
									onChange={(e) => onChange("startDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="End" required>
								<input
									required
									type="datetime-local"
									value={form.endDate}
									onChange={(e) => onChange("endDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-4">
							<Field label="Type">
								<select
									value={form.type}
									onChange={(e) =>
										onChange("type", e.target.value as EventFormState["type"])
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PAID">PAID</option>
									<option value="FREE">FREE</option>
								</select>
							</Field>
							<Field label="Mode">
								<select
									value={form.mode}
									onChange={(e) =>
										onChange("mode", e.target.value as EventFormState["mode"])
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="OFFLINE">OFFLINE</option>
									<option value="ONLINE">ONLINE</option>
								</select>
							</Field>
							<Field label="Visibility">
								<select
									value={form.visibility}
									onChange={(e) =>
										onChange(
											"visibility",
											e.target.value as EventFormState["visibility"],
										)
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PUBLIC">PUBLIC</option>
									<option value="PRIVATE">PRIVATE</option>
								</select>
							</Field>
							<Field label="Status">
								<select
									value={form.status}
									onChange={(e) =>
										onChange(
											"status",
											e.target.value as EventFormState["status"],
										)
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="DRAFT">DRAFT</option>
									<option value="PUBLISHED">PUBLISHED</option>
									<option value="COMPLETED">COMPLETED</option>
									<option value="CANCELLED">CANCELLED</option>
								</select>
							</Field>
						</div>
					</Section>

					<Section title="Media links">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Cover URL">
								<input
									value={form.coverUrl}
									onChange={(e) => onChange("coverUrl", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="Thumbnail URL">
								<input
									value={form.thumbnail}
									onChange={(e) => onChange("thumbnail", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>
					</Section>

					<div className="flex gap-3 pt-2">
						<Link
							href="/events"
							className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-100"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={updateEvent.isPending || !isDirty}
							className="flex-1 rounded-lg bg-[#0a4bb8] px-5 py-2.5 font-semibold text-white hover:bg-[#0a4bb8]/90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{updateEvent.isPending ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</span>
							) : (
								<span className="inline-flex items-center gap-2">
									<Save className="h-4 w-4" />
									Save Changes
								</span>
							)}
						</button>
					</div>
				</form>
			</div>

			{form.type === "PAID" ? (
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
					<h2 className="font-bold text-slate-900 text-xl">Ticket Tiers</h2>
					<p className="mt-1 text-slate-600 text-sm">
						Manage multiple ticket tiers for this event.
					</p>

					<div className="mt-5 space-y-3">
						{(tiersQuery.data?.data ?? []).map((tier) => {
							const draft = tierDrafts[tier.id] ?? {
								name: tier.name,
								price: String(tier.price),
								maxQuantity: String(tier.maxQuantity),
							};

							return (
								<div
									key={tier.id}
									className="rounded-xl border border-slate-200 bg-[#f8fbff] p-4"
								>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
										<input
											value={draft.name}
											onChange={(e) =>
												setTierDrafts((current) => ({
													...current,
													[tier.id]: {
														...draft,
														name: e.target.value,
													},
												}))
											}
											className="w-full rounded-lg border border-slate-300 px-3 py-2"
										/>
										<input
											type="number"
											min="0"
											value={draft.price}
											onChange={(e) =>
												setTierDrafts((current) => ({
													...current,
													[tier.id]: {
														...draft,
														price: e.target.value,
													},
												}))
											}
											className="w-full rounded-lg border border-slate-300 px-3 py-2"
										/>
										<input
											type="number"
											min="1"
											value={draft.maxQuantity}
											onChange={(e) =>
												setTierDrafts((current) => ({
													...current,
													[tier.id]: {
														...draft,
														maxQuantity: e.target.value,
													},
												}))
											}
											className="w-full rounded-lg border border-slate-300 px-3 py-2"
										/>
									</div>
									<div className="mt-3 flex items-center justify-between text-xs">
										<span className="text-slate-500">
											Sold: {tier.soldCount} / {tier.maxQuantity}
										</span>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => void handleSaveTier(tier.id)}
												className="rounded-md bg-[#0a4bb8] px-3 py-1.5 font-semibold text-white"
												disabled={isSavingTiers}
											>
												Save Tier
											</button>
											<button
												type="button"
												onClick={() => void handleDeleteTier(tier.id)}
												className="rounded-md bg-rose-50 px-3 py-1.5 font-semibold text-rose-700"
												disabled={isSavingTiers}
											>
												Delete Tier
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mt-6 rounded-xl border border-slate-200 bg-[#f8fbff] p-4">
						<p className="font-semibold text-slate-900 text-sm">Add New Tier</p>
						<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
							<input
								value={newTier.name}
								onChange={(e) =>
									setNewTier((current) => ({
										...current,
										name: e.target.value,
									}))
								}
								placeholder="Tier name"
								className="w-full rounded-lg border border-slate-300 px-3 py-2"
							/>
							<input
								type="number"
								min="0"
								value={newTier.price}
								onChange={(e) =>
									setNewTier((current) => ({
										...current,
										price: e.target.value,
									}))
								}
								placeholder="Price"
								className="w-full rounded-lg border border-slate-300 px-3 py-2"
							/>
							<input
								type="number"
								min="1"
								value={newTier.maxQuantity}
								onChange={(e) =>
									setNewTier((current) => ({
										...current,
										maxQuantity: e.target.value,
									}))
								}
								placeholder="Quantity"
								className="w-full rounded-lg border border-slate-300 px-3 py-2"
							/>
						</div>
						<button
							type="button"
							onClick={() => void handleCreateTier()}
							disabled={isSavingTiers}
							className="mt-3 rounded-md bg-[#0a4bb8] px-4 py-2 font-semibold text-sm text-white"
						>
							Add Tier
						</button>
					</div>
				</div>
			) : null}
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
		<div className="rounded-xl border border-[#dbe7ff] bg-[#f8fbff] p-5">
			<h2 className="mb-4 font-bold text-lg text-slate-900">{title}</h2>
			<div className="space-y-5">{children}</div>
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
			<p className="mb-2 block font-semibold text-slate-800 text-sm">
				{label} {required ? <span className="text-rose-500">*</span> : null}
			</p>
			{children}
		</div>
	);
}
