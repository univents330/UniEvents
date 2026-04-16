"use client";

import { CheckCircle2, Clock3, ExternalLink, XCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { useCurrentUser } from "@/features/auth";
import { useEvents } from "@/features/events";

type HostApprovalRequestsPanelProps = {
	maxItems?: number;
};

function getStatusStyles(
	status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
) {
	if (status === "PUBLISHED") {
		return {
			chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
			icon: <CheckCircle2 className="h-4 w-4" />,
			label: "Approved",
		};
	}

	if (status === "COMPLETED") {
		return {
			chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
			icon: <CheckCircle2 className="h-4 w-4" />,
			label: "Completed",
		};
	}

	if (status === "CANCELLED") {
		return {
			chip: "border-rose-200 bg-rose-50 text-rose-700",
			icon: <XCircle className="h-4 w-4" />,
			label: "Rejected",
		};
	}

	return {
		chip: "border-amber-200 bg-amber-50 text-amber-700",
		icon: <Clock3 className="h-4 w-4" />,
		label: "Pending",
	};
}

export function HostApprovalRequestsPanel({
	maxItems = 12,
}: HostApprovalRequestsPanelProps) {
	const { data: user } = useCurrentUser();
	const eventsQuery = useEvents({
		userId: user?.id,
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const myRequests = useMemo(
		() => (eventsQuery.data?.data ?? []).slice(),
		[eventsQuery.data?.data],
	);

	const pendingCount = myRequests.filter(
		(request) => request.status === "DRAFT",
	).length;
	const approvedCount = myRequests.filter(
		(request) => request.status === "PUBLISHED",
	).length;
	const rejectedCount = myRequests.filter(
		(request) => request.status === "CANCELLED",
	).length;

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<h2 className="font-semibold text-[#071a78] text-xl">
						Your Event Requests
					</h2>
					<p className="mt-1 text-slate-600 text-sm">
						Track every event you created and its approval status.
					</p>
				</div>
				<div className="flex gap-2">
					<StatusPill
						label={`${pendingCount} pending`}
						className="border-amber-200 bg-amber-50 text-amber-700"
					/>
					<StatusPill
						label={`${approvedCount} approved`}
						className="border-emerald-200 bg-emerald-50 text-emerald-700"
					/>
					<StatusPill
						label={`${rejectedCount} rejected`}
						className="border-rose-200 bg-rose-50 text-rose-700"
					/>
				</div>
			</div>

			{myRequests.length === 0 ? (
				<div className="mt-5 rounded-xl border border-slate-200 border-dashed bg-slate-50 px-4 py-8 text-center text-slate-600 text-sm">
					You haven\'t created any events yet.
				</div>
			) : (
				<div className="mt-5 space-y-4">
					{myRequests.slice(0, maxItems).map((request) => {
						const statusMeta = getStatusStyles(request.status);

						return (
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
											Submitted on{" "}
											{new Date(request.createdAt).toLocaleString("en-IN", {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</p>
										<p className="text-slate-500 text-xs">
											Last updated{" "}
											{new Date(request.updatedAt).toLocaleString("en-IN", {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</p>
										<p className="text-slate-500 text-xs">
											{request.venueName} · {request.visibility} ·{" "}
											{request.mode}
										</p>
									</div>

									<div className="flex flex-wrap items-center gap-2">
										<span
											className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold text-xs ${statusMeta.chip}`}
										>
											{statusMeta.icon}
											{statusMeta.label}
										</span>

										{request.status === "PUBLISHED" ? (
											<Link
												href={`/host/events/${request.id}` as Route}
												className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
											>
												<ExternalLink className="h-4 w-4" />
												Open Event
											</Link>
										) : null}
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
}

function StatusPill({
	label,
	className,
}: {
	label: string;
	className: string;
}) {
	return (
		<span
			className={`rounded-full border px-3 py-1 font-semibold text-xs ${className}`}
		>
			{label}
		</span>
	);
}
