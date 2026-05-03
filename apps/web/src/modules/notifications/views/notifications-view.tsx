"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useNotifications } from "../hooks/use-notifications";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const typeLabels: Record<string, string> = {
	EVENT_CREATED: "Event Created",
	EVENT_UPDATED: "Event Updated",
	EVENT_CANCELLED: "Event Cancelled",
	EVENT_REMINDER: "Reminder",
	ORDER_CONFIRMED: "Order Confirmed",
	PAYMENT_SUCCESS: "Payment Success",
	PAYMENT_FAILED: "Payment Failed",
	CHECK_IN_CONFIRMED: "Check-in",
	PASS_ISSUED: "Pass Issued",
};

export function NotificationsView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");
	const [type, setType] = useState<string>("");

	const notificationsQuery = useNotifications({
		page,
		limit: 20,
		status: (status || undefined) as "UNREAD" | "READ" | undefined,
		type: (type || undefined) as
			| "EVENT_CREATED"
			| "EVENT_UPDATED"
			| "EVENT_CANCELLED"
			| "EVENT_REMINDER"
			| "ORDER_CONFIRMED"
			| "PAYMENT_SUCCESS"
			| "PAYMENT_FAILED"
			| "CHECK_IN_CONFIRMED"
			| "PASS_ISSUED"
			| undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	if (notificationsQuery.isLoading) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				Loading notifications...
			</div>
		);
	}

	if (notificationsQuery.isError) {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
				Failed to load notifications. Please try again.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-extrabold text-3xl text-black tracking-tight">
					Notifications
				</h1>
				<div className="flex items-center gap-3">
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					>
						<option value="">All Statuses</option>
						<option value="UNREAD">Unread</option>
						<option value="READ">Read</option>
					</select>
					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					>
						<option value="">All Types</option>
						<option value="EVENT_CREATED">Event Created</option>
						<option value="EVENT_UPDATED">Event Updated</option>
						<option value="EVENT_CANCELLED">Event Cancelled</option>
						<option value="EVENT_REMINDER">Reminder</option>
						<option value="ORDER_CONFIRMED">Order Confirmed</option>
						<option value="PAYMENT_SUCCESS">Payment Success</option>
						<option value="PAYMENT_FAILED">Payment Failed</option>
						<option value="CHECK_IN_CONFIRMED">Check-in</option>
						<option value="PASS_ISSUED">Pass Issued</option>
					</select>
				</div>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
				{notificationsQuery.data?.data &&
				notificationsQuery.data.data.length > 0 ? (
					<div className="divide-y divide-slate-100">
						{notificationsQuery.data.data.map((notification) => (
							<div
								key={notification.id}
								className="flex items-start gap-4 p-6 transition-colors hover:bg-slate-50"
							>
								<div className="flex-1">
									<div className="flex items-start justify-between gap-4">
										<div>
											<h3 className="font-bold text-slate-900">
												{notification.title}
											</h3>
											<p className="mt-1 text-slate-600 text-sm">
												{notification.message}
											</p>
										</div>
										<span
											className={`rounded-full px-3 py-1 font-semibold text-xs ${
												notification.status === "UNREAD"
													? "bg-blue-100 text-blue-700"
													: notification.status === "READ"
														? "bg-slate-100 text-slate-700"
														: "bg-green-100 text-green-700"
											}`}
										>
											{notification.status}
										</span>
									</div>
									<div className="mt-3 flex items-center gap-4 text-slate-500 text-xs">
										<span className="font-semibold">
											{typeLabels[notification.type] ?? notification.type}
										</span>
										<span>•</span>
										<span>{formatDate(notification.createdAt)}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-12 text-center text-slate-500">
						No notifications found.
					</div>
				)}
			</div>

			{notificationsQuery.data?.meta &&
				notificationsQuery.data.meta.totalPages > 1 && (
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="outline"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Previous
						</Button>
						<span className="text-slate-600 text-sm">
							Page {page} of {notificationsQuery.data.meta.totalPages}
						</span>
						<Button
							variant="outline"
							onClick={() =>
								setPage((p) =>
									Math.min(notificationsQuery.data.meta.totalPages, p + 1),
								)
							}
							disabled={page === notificationsQuery.data.meta.totalPages}
						>
							Next
						</Button>
					</div>
				)}
		</div>
	);
}
