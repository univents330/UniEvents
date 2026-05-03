"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useEvents } from "@/modules/events";
import { Button } from "@/shared/ui/button";
import { useOrders } from "../hooks/use-orders";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const statusVariant: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-700",
	COMPLETED: "bg-green-100 text-green-700",
	CANCELLED: "bg-red-100 text-red-700",
};

export function OrdersView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<
		"PENDING" | "COMPLETED" | "CANCELLED" | ""
	>("");
	const [searchQuery, setSearchQuery] = useState("");

	const ordersQuery = useOrders({
		page,
		limit: 20,
		status: status || undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const eventsQuery = useEvents({ limit: 100 });
	const events = eventsQuery.data?.data ?? [];

	const eventMap = useMemo(() => {
		const map = new Map();
		for (const e of events) map.set(e.id, e);
		return map;
	}, [events]);

	if (ordersQuery.isLoading) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				Loading orders...
			</div>
		);
	}

	if (ordersQuery.isError) {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
				Failed to load orders. Please try again.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-extrabold text-3xl text-black tracking-tight">
					Orders
				</h1>
				<div className="flex items-center gap-3">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search orders..."
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
					<select
						value={status}
						onChange={(e) =>
							setStatus(
								e.target.value as "PENDING" | "COMPLETED" | "CANCELLED" | "",
							)
						}
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					>
						<option value="">All Statuses</option>
						<option value="PENDING">Pending</option>
						<option value="COMPLETED">Completed</option>
						<option value="CANCELLED">Cancelled</option>
					</select>
				</div>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
				{ordersQuery.data?.data && ordersQuery.data.data.length > 0 ? (
					<div className="divide-y divide-slate-100">
						{ordersQuery.data.data.map((order) => {
							const event = eventMap.get(order.eventId);
							return (
								<div
									key={order.id}
									className="flex items-start gap-4 p-6 transition-colors hover:bg-slate-50"
								>
									<div className="flex h-12 w-12 shrink-0 items-center justify-center border border-slate-200 bg-slate-50">
										<ShoppingBag size={20} className="text-slate-400" />
									</div>
									<div className="flex-1">
										<div className="flex items-start justify-between gap-4">
											<div>
												<div className="flex items-center gap-3">
													<h3 className="font-bold text-slate-900">
														ORD-{order.id.slice(-8).toUpperCase()}
													</h3>
													<span
														className={`rounded-full px-3 py-1 font-semibold text-xs ${statusVariant[order.status] ?? "bg-slate-100 text-slate-700"}`}
													>
														{order.status}
													</span>
												</div>
												{event && (
													<div className="mt-2 flex items-center gap-3">
														<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50">
															{event.thumbnail ? (
																<Image
																	src={event.thumbnail}
																	alt={event.name}
																	width={32}
																	height={32}
																	className="h-full w-full object-cover"
																/>
															) : (
																<ShoppingBag
																	className="text-slate-200"
																	size={16}
																/>
															)}
														</div>
														<span className="text-slate-600 text-sm">
															{event.name}
														</span>
													</div>
												)}
											</div>
											<div className="text-right">
												<p className="font-bold text-slate-900">
													₹{order.totalAmount / 100}
												</p>
												<p className="text-slate-500 text-xs">
													{formatDate(order.createdAt)}
												</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="p-12 text-center text-slate-500">
						No orders found.
					</div>
				)}
			</div>

			{ordersQuery.data?.meta && ordersQuery.data.meta.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<span className="text-slate-600 text-sm">
						Page {page} of {ordersQuery.data.meta.totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() =>
							setPage((p) => Math.min(ordersQuery.data.meta.totalPages, p + 1))
						}
						disabled={page === ordersQuery.data.meta.totalPages}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
