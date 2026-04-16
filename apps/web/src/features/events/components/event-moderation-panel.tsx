"use client";

import type { Event } from "@voltaze/db";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { useModerateEvent } from "../hooks/use-events";

interface EventModerationPanelProps {
	event: Event & { moderationStatus?: string };
	onApprovalStatusChange?: () => void;
}

export function EventModerationPanel({
	event,
	onApprovalStatusChange,
}: EventModerationPanelProps) {
	const [rejectionReason, setRejectionReason] = useState("");
	const [showRejectForm, setShowRejectForm] = useState(false);
	const moderateEvent = useModerateEvent(event.id);

	const moderationStatus = event.moderationStatus as
		| "PENDING"
		| "APPROVED"
		| "REJECTED"
		| undefined;

	const handleApprove = async () => {
		try {
			await moderateEvent.mutateAsync({
				action: "APPROVE",
			});

			onApprovalStatusChange?.();
		} catch {
			// Error notifications are handled by useModerateEvent.
		}
	};

	const handleReject = async () => {
		try {
			await moderateEvent.mutateAsync({
				action: "REJECT",
				reason: rejectionReason.trim() || "No reason provided",
			});

			setRejectionReason("");
			setShowRejectForm(false);
			onApprovalStatusChange?.();
		} catch {
			// Error notifications are handled by useModerateEvent.
		}
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-[#071a78] text-lg">
					Moderation Status
				</h3>
				<div
					className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold text-sm ${
						moderationStatus === "APPROVED"
							? "border border-green-200 bg-green-50 text-green-700"
							: moderationStatus === "PENDING"
								? "border border-amber-200 bg-amber-50 text-amber-700"
								: "border border-red-200 bg-red-50 text-red-700"
					}`}
				>
					{moderationStatus === "APPROVED" ? (
						<CheckCircle2 className="h-4 w-4" />
					) : moderationStatus === "REJECTED" ? (
						<XCircle className="h-4 w-4" />
					) : (
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
					)}
					{moderationStatus || "UNKNOWN"}
				</div>
			</div>

			{moderationStatus === "PENDING" && (
				<div className="space-y-4">
					<p className="text-slate-600 text-sm">
						This event is awaiting admin review. Review the event details and
						decide whether to approve or reject it.
					</p>

					{!showRejectForm ? (
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleApprove}
								disabled={moderateEvent.isPending}
								className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{moderateEvent.isPending ? (
									<span className="inline-flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										Approving...
									</span>
								) : (
									<span className="inline-flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4" />
										Approve Event
									</span>
								)}
							</button>
							<button
								type="button"
								onClick={() => setShowRejectForm(true)}
								disabled={moderateEvent.isPending}
								className="flex-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<span className="inline-flex items-center gap-2">
									<XCircle className="h-4 w-4" />
									Reject Event
								</span>
							</button>
						</div>
					) : (
						<div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
							<label className="block">
								<span className="font-medium text-red-900 text-sm">
									Rejection Reason (optional)
								</span>
								<textarea
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									placeholder="Explain why this event is being rejected..."
									rows={3}
									className="mt-1 w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
								/>
							</label>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleReject}
									disabled={moderateEvent.isPending}
									className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{moderateEvent.isPending ? (
										<span className="inline-flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											Rejecting...
										</span>
									) : (
										"Confirm Rejection"
									)}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowRejectForm(false);
										setRejectionReason("");
									}}
									disabled={moderateEvent.isPending}
									className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancel
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{moderationStatus === "APPROVED" && (
				<div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
					<CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
					<div>
						<p className="font-medium text-green-900">Event Approved</p>
						<p className="mt-1 text-green-800 text-sm">
							This event is approved and visible to the public.
						</p>
					</div>
				</div>
			)}

			{moderationStatus === "REJECTED" && (
				<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
					<XCircle className="h-5 w-5 shrink-0 text-red-600" />
					<div>
						<p className="font-medium text-red-900">Event Rejected</p>
						<p className="mt-1 text-red-800 text-sm">
							This event has been rejected and is not visible to the public.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
