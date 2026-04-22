"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { useEvents } from "@/modules/events";
import { useOrders } from "../hooks/use-orders";

// Skeleton loading component for table rows
function TableRowSkeleton() {
	return (
		<tr>
			<td className="px-4 py-3">
				<div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
			</td>
		</tr>
	);
}

export function HostOrdersView() {
	const { user } = useAuth();
	const [search, setSearch] = useState("");
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const hostEvents = useMemo(() => {
		const allEvents = eventsQuery.data?.data ?? [];
		if (!user?.id) return [];
		return allEvents.filter((event) => event.userId === user.id);
	}, [eventsQuery.data?.data, user?.id]);
	const hostEventIds = useMemo(
		() => new Set(hostEvents.map((e) => e.id)),
		[hostEvents],
	);
	const eventNameById = useMemo(
		() => new Map(hostEvents.map((e) => [e.id, e.name])),
		[hostEvents],
	);

	const ordersQuery = useOrders({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
	});

	const allOrders = ordersQuery.data?.data ?? [];
	const filteredHostOrders = useMemo(() => {
		return allOrders.filter((o) => hostEventIds.has(o.eventId));
	}, [allOrders, hostEventIds]);

	const visibleOrders = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return filteredHostOrders;

		return filteredHostOrders.filter((order) => {
			const eventName = eventNameById.get(order.eventId) ?? order.eventId;
			return (
				order.id.toLowerCase().includes(q) ||
				eventName.toLowerCase().includes(q) ||
				order.attendeeId.toLowerCase().includes(q)
			);
		});
	}, [filteredHostOrders, search, eventNameById]);

	const stats = useMemo(() => {
		const total = filteredHostOrders.length;
		const completed = filteredHostOrders.filter(
			(o) => o.status === "COMPLETED",
		).length;
		const pending = filteredHostOrders.filter(
			(o) => o.status === "PENDING",
		).length;
		const cancelled = filteredHostOrders.filter(
			(o) => o.status === "CANCELLED",
		).length;
		return { total, completed, pending, cancelled };
	}, [filteredHostOrders]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl text-slate-900">Orders</h1>
				<p className="mt-2 text-slate-600">
					Real orders from your created events only.
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="Search by order id, attendee id, or event..."
						className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
				</div>

				<select
					value={selectedEventId}
					onChange={(e) => setSelectedEventId(e.target.value)}
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
				<StatCard label="Total Orders" value={stats.total} />
				<StatCard label="Completed" value={stats.completed} />
				<StatCard label="Pending" value={stats.pending} />
				<StatCard label="Cancelled" value={stats.cancelled} />
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Order ID
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Attendee ID
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Status
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Created
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{ordersQuery.isLoading ? (
								<>
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
								</>
							) : visibleOrders.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										No orders found.
									</td>
								</tr>
							) : (
								visibleOrders.map((order) => (
									<tr key={order.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-[#0a4bb8]">
											{order.id}
										</td>
										<td className="px-4 py-3 text-slate-800">
											{eventNameById.get(order.eventId) ?? order.eventId}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{order.attendeeId}
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={order.status} />
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(order.createdAt).toLocaleString("en-IN")}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
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

function StatusBadge({
	status,
}: {
	status: "PENDING" | "COMPLETED" | "CANCELLED";
}) {
	const cls =
		status === "COMPLETED"
			? "bg-emerald-100 text-emerald-700 border-emerald-200"
			: status === "PENDING"
				? "bg-amber-100 text-amber-700 border-amber-200"
				: "bg-rose-100 text-rose-700 border-rose-200";

	return (
		<span
			className={`rounded-full border px-2 py-1 font-semibold text-xs ${cls}`}
		>
			{status}
		</span>
	);
}
