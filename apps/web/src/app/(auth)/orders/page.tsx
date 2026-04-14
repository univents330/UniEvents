"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/features/events";
import { useOrders } from "@/features/orders";
import { PageHeader } from "@/shared/ui/page-header";

export default function OrdersPage() {
	const { data: ordersData, isLoading } = useOrders();

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const eventById = useMemo(
		() =>
			new Map(eventsQuery.data?.data?.map((event) => [event.id, event]) ?? []),
		[eventsQuery.data?.data],
	);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const orders = ordersData?.data || [];

	return (
		<div className="space-y-4 sm:space-y-6">
			<PageHeader
				title="My Orders"
				description="View and manage your event orders"
			/>

			{orders.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-slate-600">You haven't placed any orders yet.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{orders.map((order) => (
						<Card key={order.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										{eventById.get(order.eventId)?.name ?? order.eventId}
									</CardTitle>
									<Badge
										variant={
											order.status === "COMPLETED"
												? "default"
												: order.status === "PENDING"
													? "secondary"
													: "destructive"
										}
									>
										{order.status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
									<div>
										<p className="font-medium text-slate-700">Event Date</p>
										<p className="text-slate-600">
											{format(
												new Date(
													eventById.get(order.eventId)?.startDate ??
														order.createdAt,
												),
												"PPP",
											)}
										</p>
									</div>
									<div>
										<p className="font-medium text-slate-700">Order Date</p>
										<p className="text-slate-600">
											{format(new Date(order.createdAt), "PPP")}
										</p>
									</div>
									<div>
										<p className="font-medium text-slate-700">Tickets</p>
										<p className="text-slate-600">Details unavailable</p>
									</div>
								</div>
								<div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-slate-700 text-sm">
										Ticket details are unavailable in this view.
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
