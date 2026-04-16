"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { eventsService, useEvents } from "@/features/events";
import { showNotification } from "@/shared/lib/notifications";

type AdminApprovalsPanelProps = {
	maxItems?: number;
};

export function AdminApprovalsPanel({
	maxItems = 12,
}: AdminApprovalsPanelProps) {
	const queryClient = useQueryClient();
	const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(
		null,
	);

	const approvalsQuery = useEvents({
		status: "DRAFT",
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const pendingApprovalRequests = useMemo(
		() => (approvalsQuery.data?.data ?? []).slice(),
		[approvalsQuery.data?.data],
	);

	const visibleRequests = pendingApprovalRequests.slice(0, maxItems);

	const handleApproveRequest = async (requestId: string) => {
		const request = pendingApprovalRequests.find(
			(item) => item.id === requestId,
		);
		if (!request) return;

		setReviewingRequestId(requestId);

		try {
			await eventsService.updateEvent(request.id, {
				status: "PUBLISHED",
			});

			await queryClient.invalidateQueries({ queryKey: ["events"] });

			showNotification({
				title: "Event approved",
				message: `${request.name} is now live.`,
				color: "green",
			});
		} catch {
			showNotification({
				title: "Approval failed",
				message: "Unable to publish this event right now.",
				color: "red",
			});
		} finally {
			setReviewingRequestId(null);
		}
	};

	const handleRejectRequest = (requestId: string) => {
		const request = pendingApprovalRequests.find(
			(item) => item.id === requestId,
		);
		if (!request) return;

		eventsService.updateEvent(request.id, {
			status: "CANCELLED",
		});

		queryClient.invalidateQueries({ queryKey: ["events"] });

		showNotification({
			title: "Request rejected",
			message: `${request.name} was rejected.`,
			color: "red",
		});
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<h2 className="font-semibold text-[#071a78] text-xl">
						Event Approval Queue
					</h2>
					<p className="mt-1 text-slate-600 text-sm">
						Review draft events submitted by hosts and users before publishing.
					</p>
				</div>
				<span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700 text-xs">
					{pendingApprovalRequests.length} pending
				</span>
			</div>

			{visibleRequests.length === 0 ? (
				<div className="mt-5 rounded-xl border border-slate-200 border-dashed bg-slate-50 px-4 py-8 text-center text-slate-600 text-sm">
					No pending approvals right now.
				</div>
			) : (
				<div className="mt-5 space-y-4">
					{visibleRequests.map((request) => (
						<article
							key={request.id}
							className="rounded-xl border border-[#dbe7ff] bg-[#fbfdff] p-4"
						>
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div className="min-w-0 space-y-1">
									<p className="font-semibold text-base text-slate-900">
										{request.name}
									</p>
									<p className="text-slate-600 text-sm">
										Submitted by {request.userId ?? "Unknown user"}
									</p>
									<p className="text-slate-500 text-xs">
										{new Date(request.createdAt).toLocaleString("en-IN", {
											dateStyle: "medium",
											timeStyle: "short",
										})}
									</p>
									<p className="text-slate-500 text-xs">
										{request.venueName} · {request.visibility} · {request.type}
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									{request.status === "PUBLISHED" ? (
										<Link
											href={`/admin/events/${request.id}` as Route}
											className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
										>
											<ExternalLink className="h-4 w-4" />
											Review Event
										</Link>
									) : null}
									<button
										type="button"
										disabled={reviewingRequestId === request.id}
										onClick={() => handleRejectRequest(request.id)}
										className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 font-medium text-rose-700 text-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
									>
										<XCircle className="h-4 w-4" />
										Reject
									</button>
									<button
										type="button"
										disabled={reviewingRequestId === request.id}
										onClick={() => handleApproveRequest(request.id)}
										className="inline-flex items-center gap-1 rounded-lg bg-[#0a4bb8] px-3 py-2 font-medium text-sm text-white hover:bg-[#0a4bb8]/90 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{reviewingRequestId === request.id ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Approving...
											</>
										) : (
											<>
												<CheckCircle2 className="h-4 w-4" />
												Approve
											</>
										)}
									</button>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}
