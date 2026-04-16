"use client";

import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendees } from "@/features/attendees";
import { useEvents } from "@/features/events";

const PAGE_SIZE = 50;

export default function HostAttendeesPage() {
	const [search, setSearch] = useState("");
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
	const [page, setPage] = useState(1);

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const hostEvents = eventsQuery.data?.data ?? [];
	const eventNameById = useMemo(
		() => new Map(hostEvents.map((e) => [e.id, e.name])),
		[hostEvents],
	);

	const attendeesQuery = useAttendees({
		page,
		limit: PAGE_SIZE,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
		...(search.trim() ? { search: search.trim() } : {}),
	});

	const visibleAttendees = attendeesQuery.data?.data ?? [];
	const meta = attendeesQuery.data?.meta;

	// Stats use server total so they're accurate across all pages
	const stats = useMemo(() => {
		const total = meta?.total ?? 0;
		const withPhone = visibleAttendees.filter((a) => !!a.phone).length;
		const uniqueEvents = new Set(visibleAttendees.map((a) => a.eventId)).size;
		const recent = visibleAttendees.filter(
			(a) =>
				Date.now() - new Date(a.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
		).length;
		return { total, withPhone, uniqueEvents, recent };
	}, [visibleAttendees, meta?.total]);

	function handleFilterChange(newEventId: string) {
		setSelectedEventId(newEventId);
		setPage(1);
	}

	function handleSearchChange(value: string) {
		setSearch(value);
		setPage(1);
	}

	function exportToExcel() {
		const headers = ["Name", "Email", "Phone", "Event", "Created"];
		const rows = visibleAttendees.map((a) => [
			a.name,
			a.email,
			a.phone ?? "",
			eventNameById.get(a.eventId) ?? a.eventId,
			new Date(a.createdAt).toLocaleString("en-IN"),
		]);

		const csvContent = [headers, ...rows]
			.map((row) =>
				row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
			)
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `attendees-${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-bold text-3xl text-slate-900">Attendees</h1>
					<p className="mt-2 text-slate-600">
						Real attendees from your events only.
					</p>
				</div>
				<button
					type="button"
					onClick={exportToExcel}
					disabled={visibleAttendees.length === 0}
					className="flex items-center gap-2 rounded-lg bg-[#030370] px-4 py-2 font-semibold text-sm text-white transition hover:bg-[#0a4bb8] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Download className="h-4 w-4" />
					Export CSV
				</button>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						type="text"
						placeholder="Search attendee name or email..."
						className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
				</div>

				<select
					value={selectedEventId}
					onChange={(e) => handleFilterChange(e.target.value)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All my events</option>
					{hostEvents.map((event) => (
						<option key={event.id} value={event.id}>
							{event.name}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="With phone" value={stats.withPhone} />
				<StatCard label="Events" value={stats.uniqueEvents} />
				<StatCard label="New (7d)" value={stats.recent} />
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Name
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Email
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Phone
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Created
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{attendeesQuery.isLoading ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										Loading attendees...
									</td>
								</tr>
							) : visibleAttendees.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										No attendees found.
									</td>
								</tr>
							) : (
								visibleAttendees.map((attendee) => (
									<tr key={attendee.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-slate-900">
											{attendee.name}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{attendee.email}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{attendee.phone || "-"}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{eventNameById.get(attendee.eventId) ?? attendee.eventId}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(attendee.createdAt).toLocaleString("en-IN")}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-slate-200 border-t px-4 py-3">
						<p className="text-slate-600 text-sm">
							Showing{" "}
							<span className="font-medium">
								{(page - 1) * PAGE_SIZE + 1}–
								{Math.min(page * PAGE_SIZE, meta.total)}
							</span>{" "}
							of <span className="font-medium">{meta.total}</span> attendees
						</p>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setPage((p) => p - 1)}
								disabled={!meta.hasPreviousPage}
								className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							{Array.from({ length: meta.totalPages }, (_, i) => i + 1)
								.filter(
									(p) =>
										p === 1 ||
										p === meta.totalPages ||
										Math.abs(p - page) <= 1,
								)
								.reduce<(number | "...")[]>((acc, p, idx, arr) => {
									if (idx > 0 && p - (arr[idx - 1] as number) > 1)
										acc.push("...");
									acc.push(p);
									return acc;
								}, [])
								.map((p, idx) =>
									p === "..." ? (
										<span
											key={`ellipsis-${idx}`}
											className="px-1 text-slate-400 text-sm"
										>
											…
										</span>
									) : (
										<button
											key={p}
											type="button"
											onClick={() => setPage(p as number)}
											className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition ${
												p === page
													? "bg-[#030370] text-white"
													: "text-slate-700 hover:bg-slate-100"
											}`}
										>
											{p}
										</button>
									),
								)}
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={!meta.hasNextPage}
								className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-[#dbe7ff] bg-white p-4">
			<p className="text-slate-600 text-sm">{label}</p>
			<p className="mt-1 font-bold text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}
