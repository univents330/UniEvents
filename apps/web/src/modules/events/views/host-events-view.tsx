"use client";

import {
	CalendarDays,
	PencilLine,
	Plus,
	Search,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { useDeleteEvent, useEvents } from "../hooks/use-events";

// Skeleton loading components
function EventCardSkeleton() {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
					<div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
				</div>
				<div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
			</div>
			<div className="mt-3 space-y-1.5">
				<div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
				<div className="h-4 w-full animate-pulse rounded bg-slate-200" />
			</div>
			<div className="mt-4 flex gap-2">
				<div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
				<div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
				<div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
			</div>
			<div className="mt-4 flex justify-end gap-2 border-slate-100 border-t pt-3">
				<div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
				<div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
			</div>
		</div>
	);
}

export function HostEventsView() {
	const { user } = useAuth();
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<
		"ALL" | "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
	>("ALL");
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const deleteEvent = useDeleteEvent();

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(status !== "ALL" ? { status } : {}),
		...(search.trim() ? { search: search.trim() } : {}),
	});

	const events = useMemo(() => {
		const allEvents = eventsQuery.data?.data ?? [];
		if (!user?.id) return [];
		return allEvents.filter((event) => event.userId === user.id);
	}, [eventsQuery.data?.data, user?.id]);

	const stats = useMemo(() => {
		const total = events.length;
		const draft = events.filter((e) => e.status === "DRAFT").length;
		const published = events.filter((e) => e.status === "PUBLISHED").length;
		const completed = events.filter((e) => e.status === "COMPLETED").length;
		const live = events.filter((e) => {
			const now = Date.now();
			return (
				new Date(e.startDate).getTime() <= now &&
				new Date(e.endDate).getTime() >= now
			);
		}).length;
		return { total, draft, published, completed, live };
	}, [events]);

	const handleDelete = async (eventId: string, eventName: string) => {
		const ok = window.confirm(
			`Delete "${eventName}"? This will remove the event permanently.`,
		);
		if (!ok) return;

		setDeletingId(eventId);
		try {
			await deleteEvent.mutateAsync(eventId);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-5">
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-gradient-to-br from-[#ebf3ff] via-white to-[#f4f8ff] p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-black text-3xl text-slate-900 tracking-tight">
							Events Studio
						</h1>
						<p className="mt-1 text-slate-600">
							Edit, publish, and clean up your events from one place.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-3 py-1 font-semibold text-[#0a4bb8] text-sm">
							<Users className="h-4 w-4" />
							{stats.total.toLocaleString("en-IN")} managed
						</span>
						<Link
							href="/events/create"
							className="!text-white inline-flex items-center gap-2 rounded-xl bg-[#0a4bb8] px-4 py-2 font-semibold hover:bg-[#0a4bb8]/90"
						>
							<Plus className="h-5 w-5" />
							Create Event
						</Link>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-5">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="Published" value={stats.published} />
				<StatCard label="Draft" value={stats.draft} />
				<StatCard label="Live now" value={stats.live} />
				<StatCard label="Completed" value={stats.completed} />
			</div>

			<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
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
			</div>

			{eventsQuery.isLoading ? (
				<div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
					<EventCardSkeleton />
					<EventCardSkeleton />
					<EventCardSkeleton />
					<EventCardSkeleton />
				</div>
			) : events.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
					No events found for current filters.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
					{events.map((event) => (
						<div
							key={event.id}
							className="rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-sm transition hover:border-[#abc8ff]"
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
								<StatusBadge status={event.status} />
							</div>

							<div className="mt-3 space-y-1.5 text-slate-600 text-sm">
								<p className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4" />
									{new Date(event.startDate).toLocaleString("en-IN")}
								</p>
								<p className="line-clamp-2">{event.address}</p>
							</div>

							<div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
								<Tag>{event.mode}</Tag>
								<Tag>{event.type}</Tag>
								<Tag>{event.visibility}</Tag>
							</div>

							<div className="mt-4 flex items-center justify-end gap-2 border-slate-100 border-t pt-3">
								<Link
									href={`/events/${event.id}/edit`}
									className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 text-sm hover:bg-slate-50"
								>
									<PencilLine className="h-4 w-4" />
									Edit
								</Link>
								<button
									type="button"
									onClick={() => handleDelete(event.id, event.name)}
									disabled={deleteEvent.isPending && deletingId === event.id}
									className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-700 text-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
								>
									<Trash2 className="h-4 w-4" />
									{deleteEvent.isPending && deletingId === event.id
										? "Deleting..."
										: "Delete"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl border border-[#dbe7ff] bg-white p-3.5">
			<p className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-1 font-black text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}

function Tag({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-full border border-[#dbe7ff] bg-[#f5f9ff] px-2.5 py-1 font-semibold text-[#0a4bb8]">
			{children}
		</span>
	);
}

function StatusBadge({
	status,
}: {
	status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}) {
	const klass =
		status === "PUBLISHED"
			? "bg-emerald-100 text-emerald-700 border-emerald-200"
			: status === "DRAFT"
				? "bg-amber-100 text-amber-700 border-amber-200"
				: status === "COMPLETED"
					? "bg-blue-100 text-blue-700 border-blue-200"
					: "bg-rose-100 text-rose-700 border-rose-200";

	return (
		<span
			className={`rounded-full border px-2 py-1 font-semibold text-xs ${klass}`}
		>
			{status}
		</span>
	);
}
