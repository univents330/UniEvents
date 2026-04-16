"use client";

import { CalendarDays, Search, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useEvents } from "@/features/events";

export default function AdminEventsPage() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<
		"ALL" | "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
	>("ALL");
	const [hostId, setHostId] = useState<string>("ALL");

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(status !== "ALL" ? { status } : {}),
		...(search.trim() ? { search: search.trim() } : {}),
	});

	const allEvents = eventsQuery.data?.data ?? [];
	const hostIds = useMemo(
		() =>
			Array.from(
				new Set(
					allEvents
						.map((event) => event.userId)
						.filter((id): id is string => typeof id === "string"),
				),
			),
		[allEvents],
	);

	const visibleEvents = useMemo(() => {
		if (hostId === "ALL") return allEvents;
		return allEvents.filter((event) => event.userId === hostId);
	}, [allEvents, hostId]);

	return (
		<div className="space-y-5">
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-linear-to-br from-[#ebf3ff] via-white to-[#f4f8ff] p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-black text-3xl text-slate-900 tracking-tight">
							All Events
						</h1>
						<p className="mt-1 text-slate-600">
							Super admin visibility across all host events.
						</p>
					</div>
					<span className="inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-3 py-1 font-semibold text-[#0a4bb8] text-sm">
						<Users className="h-4 w-4" />
						{hostIds.length.toLocaleString("en-IN")} hosts
					</span>
				</div>
			</div>

			<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-center">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="Search by event title or venue"
						className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
				</div>

				<select
					value={status}
					onChange={(e) => setStatus(e.target.value as typeof status)}
					className="rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All status</option>
					<option value="DRAFT">Draft</option>
					<option value="PUBLISHED">Published</option>
					<option value="COMPLETED">Completed</option>
					<option value="CANCELLED">Cancelled</option>
				</select>

				<select
					value={hostId}
					onChange={(e) => setHostId(e.target.value)}
					className="rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All hosts</option>
					{hostIds.map((id) => (
						<option key={id} value={id}>
							{id}
						</option>
					))}
				</select>
			</div>

			{eventsQuery.isLoading ? (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
					Loading events...
				</div>
			) : visibleEvents.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
					No events found.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
					{visibleEvents.map((event) => (
						<div
							key={event.id}
							className="rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-sm"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="line-clamp-1 font-bold text-lg text-slate-900">
										{event.name}
									</h3>
									<p className="mt-0.5 line-clamp-1 text-slate-500 text-sm">
										{event.venueName}
									</p>
								</div>
								<span className="rounded-full border border-[#dbe7ff] bg-[#f5f9ff] px-2 py-1 font-semibold text-[#0a4bb8] text-xs">
									{event.status}
								</span>
							</div>

							<div className="mt-3 space-y-1.5 text-slate-600 text-sm">
								<p className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4" />
									{new Date(event.startDate).toLocaleString("en-IN")}
								</p>
								<p className="font-mono text-xs">
									Host: {event.userId ?? "N/A"}
								</p>
							</div>

							<div className="mt-4 flex items-center justify-end border-slate-100 border-t pt-3">
								<Link
									href={`/admin/events/${event.id}` as Route}
									className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 text-sm hover:bg-slate-50"
								>
									Open
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
