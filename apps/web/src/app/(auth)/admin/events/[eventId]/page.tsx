"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEvent } from "@/features/events";
import { EventModerationPanel } from "@/features/events/components/event-moderation-panel";

export default function AdminEventDetailPage() {
	const params = useParams<{ eventId: string }>();
	const eventId = typeof params?.eventId === "string" ? params.eventId : "";
	const eventQuery = useEvent(eventId);

	if (eventQuery.isLoading || !eventQuery.data) {
		return (
			<div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
				<Loader2 className="h-6 w-6 animate-spin text-slate-600" />
				<span className="ml-2 text-slate-600">Loading event details...</span>
			</div>
		);
	}

	const event = eventQuery.data;

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center gap-4">
				<Link
					href={"/admin/events" as Route}
					className="rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<ArrowLeft className="h-5 w-5 text-slate-600" />
				</Link>
				<div>
					<h1 className="font-black text-3xl text-slate-900 tracking-tight">
						{event.name}
					</h1>
					<p className="mt-1 text-slate-600">Review and moderate this event</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 lg:col-span-2">
					<h3 className="mb-4 font-semibold text-[#071a78] text-lg">
						Event Details
					</h3>

					<div className="space-y-4">
						<div>
							<p className="text-slate-600 text-sm">Event Name</p>
							<p className="mt-1 font-medium text-slate-900">{event.name}</p>
						</div>

						<div>
							<p className="text-slate-600 text-sm">Description</p>
							<p className="mt-1 whitespace-pre-wrap text-slate-900 text-sm">
								{event.description}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-slate-600 text-sm">Venue Name</p>
								<p className="mt-1 font-medium text-slate-900">
									{event.venueName}
								</p>
							</div>
							<div>
								<p className="text-slate-600 text-sm">Address</p>
								<p className="mt-1 font-medium text-slate-900">
									{event.address}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-slate-600 text-sm">Start Date</p>
								<p className="mt-1 font-medium text-slate-900">
									{new Date(event.startDate).toLocaleString("en-IN")}
								</p>
							</div>
							<div>
								<p className="text-slate-600 text-sm">End Date</p>
								<p className="mt-1 font-medium text-slate-900">
									{new Date(event.endDate).toLocaleString("en-IN")}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-slate-600 text-sm">Type</p>
								<p className="mt-1 font-medium text-slate-900">{event.type}</p>
							</div>
							<div>
								<p className="text-slate-600 text-sm">Mode</p>
								<p className="mt-1 font-medium text-slate-900">{event.mode}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-slate-600 text-sm">Visibility</p>
								<p className="mt-1 font-medium text-slate-900">
									{event.visibility}
								</p>
							</div>
							<div>
								<p className="text-slate-600 text-sm">Status</p>
								<p className="mt-1 font-medium text-slate-900">
									{event.status}
								</p>
							</div>
						</div>

						<div>
							<p className="text-slate-600 text-sm">Hosted by</p>
							<p className="mt-1 font-mono text-slate-900 text-sm">
								{event.userId || "Unknown"}
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<EventModerationPanel
						event={event}
						onApprovalStatusChange={() => {
							eventQuery.refetch();
						}}
					/>
				</div>
			</div>
		</div>
	);
}
