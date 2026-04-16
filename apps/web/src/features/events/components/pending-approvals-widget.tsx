"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useEvents } from "../hooks/use-events";

export function PendingApprovalsWidget() {
	const eventsQuery = useEvents({
		page: 1,
		limit: 10,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const allEvents = eventsQuery.data?.data ?? [];
	const pendingEvents = useMemo(
		() => allEvents.filter((event) => event.moderationStatus === "PENDING"),
		[allEvents],
	);

	if (pendingEvents.length === 0) {
		return (
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-[#071a78] text-lg">
							Pending Approvals
						</h3>
						<p className="mt-1 text-slate-600 text-sm">
							No events awaiting approval
						</p>
					</div>
					<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
						<AlertCircle className="h-5 w-5 text-emerald-600" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-[#071a78] text-lg">
						Pending Approvals
					</h3>
					<p className="mt-1 text-slate-600 text-sm">
						{pendingEvents.length}{" "}
						{pendingEvents.length === 1 ? "event" : "events"} awaiting approval
					</p>
				</div>
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
					<AlertCircle className="h-5 w-5 text-amber-600" />
				</div>
			</div>

			<div className="mt-4 space-y-2">
				{pendingEvents.slice(0, 3).map((event) => (
					<Link
						key={event.id}
						href={`/admin/events/${event.id}`}
						className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-[#0a4bb8] hover:bg-blue-50"
					>
						<div className="mt-0.5 shrink-0">
							<div className="flex h-2 w-2 items-center justify-center rounded-full bg-amber-500" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="line-clamp-1 font-medium text-slate-900 text-sm">
								{event.name}
							</p>
							<p className="line-clamp-1 text-slate-500 text-xs">
								{event.venueName}
							</p>
						</div>
						<div className="shrink-0">
							<ArrowRight className="h-4 w-4 text-slate-400" />
						</div>
					</Link>
				))}
			</div>

			{pendingEvents.length > 3 && (
				<Link
					href="/admin/events?moderationStatus=PENDING"
					className="mt-4 inline-flex items-center gap-2 font-medium text-[#0a4bb8] text-sm hover:text-[#0a4bb8]/80"
				>
					View all {pendingEvents.length} pending events
					<ArrowRight className="h-4 w-4" />
				</Link>
			)}
		</div>
	);
}
