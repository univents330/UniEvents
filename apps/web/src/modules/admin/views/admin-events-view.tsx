"use client";

import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useApproveEvent, useEvents } from "@/modules/events/hooks/use-events";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function AdminEventsView() {
	const { data, isLoading } = useEvents({
		page: 1,
		limit: 100,
		isApproved: false,
	});

	const approveMutation = useApproveEvent();

	const handleApprove = async (eventId: string) => {
		try {
			await approveMutation.mutateAsync({ eventId, isApproved: true });
			toast.success("Event approved successfully");
		} catch (_error) {
			toast.error("Failed to approve event");
		}
	};

	const handleReject = async (eventId: string) => {
		try {
			await approveMutation.mutateAsync({ eventId, isApproved: false });
			toast.success("Event rejected and moved to draft");
		} catch (_error) {
			toast.error("Failed to reject event");
		}
	};

	const events = data?.data || [];

	if (isLoading) {
		return <div className="p-8">Loading unapproved events...</div>;
	}

	return (
		<div className="space-y-6 p-8">
			<div>
				<h1 className="font-extrabold text-3xl text-[#070190]">
					Event Approvals
				</h1>
				<p className="text-slate-500">
					Review and approve events before they go public.
				</p>
			</div>

			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<table className="w-full text-left">
					<thead className="border-slate-200 border-b bg-slate-50">
						<tr>
							<th className="px-6 py-4 font-bold text-slate-700 text-sm">
								Event
							</th>
							<th className="px-6 py-4 font-bold text-slate-700 text-sm">
								Date
							</th>
							<th className="px-6 py-4 font-bold text-slate-700 text-sm">
								Venue
							</th>
							<th className="px-6 py-4 text-right font-bold text-slate-700 text-sm">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{events.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-6 py-12 text-center text-slate-400"
								>
									No pending events for approval.
								</td>
							</tr>
						) : (
							events.map((event) => (
								<tr key={event.id} className="hover:bg-slate-50/50">
									<td className="px-6 py-4">
										<div className="flex flex-col">
											<div className="flex items-center gap-2">
												<span className="font-bold text-slate-900">
													{event.name}
												</span>
												<Badge variant="outline" className="text-[10px]">
													{event.type}
												</Badge>
												<Badge
													variant={
														event.status === "PUBLISHED"
															? "default"
															: "secondary"
													}
													className={`text-[10px] ${
														event.status === "PUBLISHED"
															? "border-emerald-100 bg-emerald-50 text-emerald-700"
															: "border-amber-100 bg-amber-50 text-amber-700"
													}`}
												>
													{event.status}
												</Badge>
											</div>
											<span className="max-w-xs truncate text-slate-500 text-xs">
												{event.description}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="text-slate-600 text-sm">
											{format(new Date(event.startDate), "MMM d, yyyy")}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex justify-end gap-2">
											<Button
												size="sm"
												variant="outline"
												className="h-8 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
												onClick={() => handleReject(event.id)}
												disabled={approveMutation.isPending}
											>
												<XCircle className="mr-1.5 h-3.5 w-3.5" />
												Reject
											</Button>
											<Button
												size="sm"
												className="!text-white h-8 rounded-full bg-emerald-600 hover:bg-emerald-700"
												onClick={() => handleApprove(event.id)}
												disabled={
													approveMutation.isPending || event.status === "DRAFT"
												}
											>
												<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
												Approve
											</Button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
