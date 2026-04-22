"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";
import { useCreateEvent } from "../hooks/use-events";

type EventFormState = {
	name: string;
	slug: string;
	description: string;
	type: "FREE" | "PAID";
	mode: "OFFLINE" | "ONLINE";
	startDate: string;
	endDate: string;
	timezone: string;
	venueName: string;
	address: string;
	coverUrl: string;
	thumbnail: string;
	visibility: "PUBLIC" | "PRIVATE";
};

export function CreateEventView() {
	const router = useRouter();
	const createEventMutation = useCreateEvent();
	const [error, setError] = useState("");
	const [formData, setFormData] = useState<EventFormState>({
		name: "",
		slug: "",
		description: "",
		type: "FREE",
		mode: "OFFLINE",
		startDate: new Date().toISOString().slice(0, 16),
		endDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
		timezone: "Asia/Kolkata",
		venueName: "",
		address: "",
		coverUrl:
			"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
		thumbnail:
			"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
		visibility: "PUBLIC",
	});

	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function handleChange(
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) {
		const { name, value } = e.target;
		const key = name as keyof EventFormState;

		setFormData((prev) => ({
			...prev,
			[key]: value as EventFormState[typeof key],
			...(key === "name" && !prev.slug ? { slug: generateSlug(value) } : {}),
		}));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		try {
			const { slug, ...validData } = formData;

			const event = await createEventMutation.mutateAsync({
				...validData,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
				latitude: "0.00",
				longitude: "0.00",
			});

			router.push(`/events/${event.id}`);
		} catch (submitError) {
			console.error("Failed to create event:", submitError);
			setError(getApiErrorMessage(submitError, "Failed to create the event."));
		}
	}

	return (
		<div className="mx-auto max-w-4xl space-y-8">
			<SectionTitle
				eyebrow="Host panel"
				title="Publish a new event"
				description="Define your event details, set the correct mode and dates, and let attendees know."
			/>

			<form onSubmit={handleSubmit} className="panel-soft space-y-6 p-6 md:p-8">
				{error && (
					<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
						{error}
					</div>
				)}

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<label
							htmlFor="event-name"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Event Name
						</label>
						<input
							required
							id="event-name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="e.g. Next.js Conf 2026"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-slug"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							URL Slug
						</label>
						<input
							required
							id="event-slug"
							name="slug"
							value={formData.slug}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-[#f8faff] px-4 text-[#5f6984] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="nextjs-conf-2026"
						/>
					</div>

					<div className="space-y-2 md:col-span-2">
						<label
							htmlFor="event-description"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Description
						</label>
						<textarea
							required
							id="event-description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={4}
							className="w-full rounded-xl border border-[#d4def8] bg-white p-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="Describe your event..."
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-type"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Event Type
						</label>
						<select
							id="event-type"
							name="type"
							value={formData.type}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						>
							<option value="FREE">Free</option>
							<option value="PAID">Paid</option>
						</select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-mode"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Mode
						</label>
						<select
							id="event-mode"
							name="mode"
							value={formData.mode}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						>
							<option value="OFFLINE">Offline (In-person)</option>
							<option value="ONLINE">Online (Virtual)</option>
						</select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-venue-name"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Venue Name
						</label>
						<input
							required
							id="event-venue-name"
							name="venueName"
							value={formData.venueName}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="e.g. Moscone Center or Google Meet"
						/>
					</div>

					<div className="space-y-2 md:col-span-2">
						<label
							htmlFor="event-address"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Address or Link
						</label>
						<input
							required
							id="event-address"
							name="address"
							value={formData.address}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="Venue address or meeting link"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-start-date"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							Start Date & Time
						</label>
						<input
							required
							type="datetime-local"
							id="event-start-date"
							name="startDate"
							value={formData.startDate}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="event-end-date"
							className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
						>
							End Date & Time
						</label>
						<input
							required
							type="datetime-local"
							id="event-end-date"
							name="endDate"
							value={formData.endDate}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						/>
					</div>
				</div>

				<div className="my-8 border-[#d7e0f8] border-t" />

				<div className="flex items-center gap-4">
					<Button
						type="submit"
						size="lg"
						disabled={createEventMutation.isPending}
					>
						{createEventMutation.isPending ? "Creating..." : "Create Event"}
					</Button>
					<Button type="button" variant="ghost" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
