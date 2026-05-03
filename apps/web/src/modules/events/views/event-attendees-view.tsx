"use client";

import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendees } from "@/modules/attendees/hooks/use-attendees";
import { useEvent } from "../hooks/use-events";

function TableRowSkeleton() {
	return (
		<tr>
			<td className="px-4 py-3">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
			</td>
		</tr>
	);
}

const PAGE_SIZE = 50;

export function EventAttendeesView({ eventId }: { eventId: string }) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const eventQuery = useEvent(eventId);
	const event = eventQuery.data;

	const attendeesQuery = useAttendees({
		page,
		limit: PAGE_SIZE,
		sortBy: "createdAt",
		sortOrder: "desc",
		eventId,
		...(search.trim() ? { search: search.trim() } : {}),
	});

	const attendees = attendeesQuery.data?.data ?? [];
	const meta = attendeesQuery.data?.meta;

	const stats = useMemo(() => {
		const total = meta?.total ?? 0;
		const recent = attendees.filter(
			(a) =>
				Date.now() - new Date(a.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
		).length;
		return { total, recent };
	}, [attendees, meta?.total]);

	function handleSearchChange(value: string) {
		setSearch(value);
		setPage(1);
	}

	function exportToExcel() {
		if (!event) return;
		const headers = ["Name", "Email", "Phone", "Created"];
		const rows = attendees.map((a) => [
			a.name,
			a.email,
			a.phone ?? "",
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
		link.download = `attendees-${event.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-slate-900 text-xl tracking-tight">
						Attendees
					</h2>
					<p className="text-slate-500 text-sm">
						Manage participants registered for this event.
					</p>
				</div>
				<button
					type="button"
					onClick={exportToExcel}
					disabled={attendees.length === 0}
					className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Download className="h-4 w-4" />
					Export CSV
				</button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<StatCard label="Total Attendees" value={stats.total} />
				<StatCard label="New (Last 7d)" value={stats.recent} />
				<div className="relative flex items-center">
					<Search className="absolute left-4 h-4 w-4 text-slate-400" />
					<input
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						type="text"
						placeholder="Search by name or email..."
						className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
					/>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-slate-100 border-b bg-slate-50/50">
								<th className="px-6 py-4 font-bold text-slate-900">Name</th>
								<th className="px-6 py-4 font-bold text-slate-900">Email</th>
								<th className="px-6 py-4 font-bold text-slate-900">Phone</th>
								<th className="px-6 py-4 font-bold text-slate-900">
									Registered
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{attendeesQuery.isLoading ? (
								<>
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
								</>
							) : attendees.length === 0 ? (
								<tr>
									<td
										className="px-6 py-12 text-center text-slate-500"
										colSpan={4}
									>
										No attendees found matching your criteria.
									</td>
								</tr>
							) : (
								attendees.map((attendee) => (
									<tr
										key={attendee.id}
										className="transition-colors hover:bg-slate-50/50"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
													{attendee.name.charAt(0)}
												</div>
												<span className="font-semibold text-slate-900">
													{attendee.name}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 text-slate-600">
											{attendee.email}
										</td>
										<td className="px-6 py-4 text-slate-600">
											{attendee.phone || "—"}
										</td>
										<td className="px-6 py-4 text-slate-500">
											{new Date(attendee.createdAt).toLocaleDateString(
												"en-IN",
												{
													dateStyle: "medium",
												},
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-slate-100 border-t bg-slate-50/30 px-6 py-4">
						<p className="text-slate-500 text-xs">
							Showing{" "}
							<span className="font-bold text-slate-900">
								{(page - 1) * PAGE_SIZE + 1}
							</span>{" "}
							to{" "}
							<span className="font-bold text-slate-900">
								{Math.min(page * PAGE_SIZE, meta.total)}
							</span>{" "}
							of <span className="font-bold text-slate-900">{meta.total}</span>{" "}
							attendees
						</p>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setPage((p) => p - 1)}
								disabled={!meta.hasPreviousPage}
								className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
							>
								<ChevronLeft size={18} />
							</button>
							<span className="px-3 font-bold text-slate-900 text-xs">
								Page {page} of {meta.totalPages}
							</span>
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={!meta.hasNextPage}
								className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
							>
								<ChevronRight size={18} />
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
		<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
				{label}
			</p>
			<p className="mt-1 font-black text-2xl text-slate-900 tracking-tight">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}
