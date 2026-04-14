"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/features/events";
import { usePasses } from "@/features/passes";
import { PageHeader } from "@/shared/ui/page-header";

export default function PassesPage() {
	const { data: passesData, isLoading } = usePasses();
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

	const passes = passesData?.data || [];

	return (
		<div className="space-y-4 sm:space-y-6">
			<PageHeader title="My Passes" description="View your event passes" />

			{passes.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-slate-600">You don't have any passes yet.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{passes.map((pass) => (
						<Card key={pass.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										{eventById.get(pass.eventId)?.name ?? pass.eventId}
									</CardTitle>
									<div className="flex items-center gap-2">
										<Badge
											variant={
												pass.status === "ACTIVE"
													? "default"
													: pass.status === "USED"
														? "secondary"
														: "destructive"
											}
										>
											{pass.status}
										</Badge>
										<Badge variant="outline">{pass.type}</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
									<div>
										<p className="font-medium text-slate-700">Event Date</p>
										<p className="text-slate-600">
											{format(
												new Date(
													eventById.get(pass.eventId)?.startDate ??
														pass.createdAt,
												),
												"PPP",
											)}
										</p>
									</div>
									<div>
										<p className="font-medium text-slate-700">Issue Date</p>
										<p className="text-slate-600">
											{format(new Date(pass.createdAt), "PPP")}
										</p>
									</div>
								</div>
								<div className="mt-4 rounded-lg bg-slate-50 p-3">
									<p className="mb-2 font-medium text-slate-700">Pass Code</p>
									<p className="font-mono text-slate-600 text-sm">
										{pass.code}
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
