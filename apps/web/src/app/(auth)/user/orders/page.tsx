"use client";

import type { Order } from "@voltaze/schema";
import { format } from "date-fns";
import {
	Calendar,
	Clock,
	Loader2,
	MapPin,
	Ticket as TicketIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events";
import { useOrders } from "@/features/orders";

export default function UserOrdersPage() {
	const { data: response, isLoading, isError } = useOrders({ limit: 50 });

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<h1 className="font-bold text-2xl text-[#071a78]">My Orders</h1>
				<p className="mt-2 text-slate-600">
					View all your ticket orders and purchases.
				</p>
			</div>

			<div className="space-y-4">
				{isLoading ? (
					[...Array(3)].map((_, i) => (
						<Skeleton key={i} className="h-32 w-full rounded-2xl" />
					))
				) : isError ? (
					<div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
						Failed to load orders. Please try again later.
					</div>
				) : response?.data && response.data.length > 0 ? (
					response.data.map((order) => (
						<OrderCard key={order.id} order={order} />
					))
				) : (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-[#dbe7ff] border-dashed bg-white p-12 text-center">
						<TicketIcon className="mb-4 h-12 w-12 text-slate-300" />
						<h3 className="font-semibold text-lg text-slate-700">
							No Orders Yet
						</h3>
						<p className="mt-2 max-w-sm text-slate-500">
							Looks like you haven't bought any tickets. Browse events to get
							started!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function OrderCard({ order }: { order: Order }) {
	const { data: event, isLoading: isLoadingEvent } = useEvent(order.eventId);

	const getStatusColor = (status: Order["status"]) => {
		switch (status) {
			case "COMPLETED":
				return "bg-emerald-100 text-emerald-800 border-emerald-200";
			case "PENDING":
				return "bg-amber-100 text-amber-800 border-amber-200";
			case "CANCELLED":
				return "bg-slate-100 text-slate-800 border-slate-200";
			default:
				return "bg-blue-100 text-blue-800 border-blue-200";
		}
	};

	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
			<div className="flex-1 space-y-3">
				<div className="flex items-center gap-3">
					<Badge variant="outline" className={getStatusColor(order.status)}>
						{order.status}
					</Badge>
					<span className="text-slate-500 text-sm">
						Order ID: {order.id.slice(-8).toUpperCase()}
					</span>
					<span className="text-slate-500 text-sm">
						{format(new Date(order.createdAt), "MMM d, yyyy")}
					</span>
				</div>

				<div className="space-y-1">
					{isLoadingEvent ? (
						<Skeleton className="h-6 w-3/4" />
					) : (
						<h3 className="font-semibold text-lg text-slate-800">
							{event?.name || "Unknown Event"}
						</h3>
					)}
					{isLoadingEvent ? (
						<Skeleton className="h-4 w-1/2" />
					) : event ? (
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-sm">
							<div className="flex items-center gap-1">
								<Calendar className="h-3.5 w-3.5" />
								<span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
							</div>
							<div className="flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								<span className="max-w-[200px] truncate">
									{event.venueName}
								</span>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
