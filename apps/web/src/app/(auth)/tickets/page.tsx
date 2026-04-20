"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/features/events";
import { useTickets } from "@/features/tickets";
import { PageHeader } from "@/shared/ui/page-header";

export default function TicketsPage() {
	const { data: ticketsData, isLoading } = useTickets();
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

	const tickets = ticketsData?.data || [];

	return (
		<div className="space-y-4 sm:space-y-6">
			<PageHeader title="My Tickets" description="View your event tickets" />

			{tickets.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-slate-600">You don't have any tickets yet.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{tickets.map((ticket) => (
						<Card key={ticket.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										{eventById.get(ticket.eventId)?.name ?? ticket.eventId}
									</CardTitle>
									<Badge variant="outline">{ticket.tierId}</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
									<div>
										<p className="font-medium text-slate-700">Event Date</p>
										<p className="text-slate-600">
											{format(
												new Date(
													eventById.get(ticket.eventId)?.startDate ??
														ticket.createdAt,
												),
												"PPP",
											)}
										</p>
									</div>
									<div>
										<p className="font-medium text-slate-700">Purchase Date</p>
										<p className="text-slate-600">
											{format(new Date(ticket.createdAt), "PPP")}
										</p>
									</div>
									<div>
										<p className="font-medium text-slate-700">Price</p>
										<p className="text-slate-600">
											₹{ticket.pricePaid.toFixed(2)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
