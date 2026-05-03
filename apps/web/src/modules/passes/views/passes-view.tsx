"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { usePasses } from "../hooks/use-passes";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function PassesView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");
	const passesQuery = usePasses({
		page,
		limit: 20,
		status: (status || undefined) as
			| "ACTIVE"
			| "USED"
			| "CANCELLED"
			| undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	if (passesQuery.isLoading) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				Loading passes...
			</div>
		);
	}

	if (passesQuery.isError) {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
				Failed to load passes. Please try again.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-extrabold text-3xl text-black tracking-tight">
					My Passes
				</h1>
				<select
					value={status}
					onChange={(e) => {
						setStatus(e.target.value);
						setPage(1);
					}}
					className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="">All Statuses</option>
					<option value="ACTIVE">Active</option>
					<option value="USED">Used</option>
					<option value="CANCELLED">Cancelled</option>
				</select>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{passesQuery.data?.data && passesQuery.data.data.length > 0 ? (
					passesQuery.data.data.map((pass) => (
						<div
							key={pass.id}
							className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
						>
							<div className="mb-4 flex items-center justify-between">
								<span
									className={`rounded-full px-3 py-1 font-semibold text-xs ${
										pass.status === "ACTIVE"
											? "bg-green-100 text-green-700"
											: pass.status === "USED"
												? "bg-slate-100 text-slate-700"
												: "bg-red-100 text-red-700"
									}`}
								>
									{pass.status}
								</span>
								<span className="text-slate-500 text-xs">
									{formatDate(pass.createdAt)}
								</span>
							</div>

							<div className="mb-4 flex justify-center">
								<div className="rounded-lg border border-slate-200 bg-white p-4">
									<QRCodeSVG value={pass.code} size={120} level="M" />
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-slate-600 text-sm">Pass Code</span>
									<span className="font-mono font-semibold text-sm">
										{pass.code}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-slate-600 text-sm">Event ID</span>
									<span className="font-mono text-slate-500 text-xs">
										{pass.eventId.slice(0, 8)}...
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-slate-600 text-sm">Attendee ID</span>
									<span className="font-mono text-slate-500 text-xs">
										{pass.attendeeId.slice(0, 10)}...
									</span>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="col-span-full p-12 text-center text-slate-500">
						No passes found.
					</div>
				)}
			</div>

			{passesQuery.data?.meta && passesQuery.data.meta.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<span className="text-slate-600 text-sm">
						Page {page} of {passesQuery.data.meta.totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() =>
							setPage((p) => Math.min(passesQuery.data.meta.totalPages, p + 1))
						}
						disabled={page === passesQuery.data.meta.totalPages}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
