"use client";

import { format } from "date-fns";
import {
	Banknote,
	Calendar,
	CreditCard,
	Loader2,
	Search,
	ShieldCheck,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/core/components/protected-route";
import { cn } from "@/core/lib/cn";
import { usePayments } from "@/modules/payments";
import { Badge } from "@/shared/ui/badge";

const statusStyles: Record<string, string> = {
	PENDING: "bg-amber-50 text-amber-700 border-amber-200",
	SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
	FAILED: "bg-rose-50 text-rose-700 border-rose-200",
	REFUNDED: "bg-slate-50 text-slate-700 border-slate-200",
};

function PaymentsPageContent() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<
		"" | "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
	>("");
	const [searchQuery, setSearchQuery] = useState("");

	const paymentsQuery = usePayments({
		page,
		limit: 10,
		status: status || undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const stats = useMemo(() => {
		const data = paymentsQuery.data?.data ?? [];
		return {
			totalSpent: data
				.filter((p) => p.status === "SUCCESS")
				.reduce((acc, p) => acc + p.amount, 0),
			successCount: data.filter((p) => p.status === "SUCCESS").length,
			pendingCount: data.filter((p) => p.status === "PENDING").length,
		};
	}, [paymentsQuery.data]);

	const filteredPayments = useMemo(() => {
		const data = paymentsQuery.data?.data ?? [];
		if (!searchQuery) return data;
		return data.filter(
			(p) =>
				p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [paymentsQuery.data, searchQuery]);

	if (paymentsQuery.isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-[#071a78]" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			{/* Header */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-bold text-2xl text-[#071a78]">
							Payment History
						</h1>
						<p className="mt-1 text-slate-600">
							View all your payment transactions and spending history.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								placeholder="Search payments..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-10 w-full rounded-lg border border-[#dbe7ff] bg-white pr-4 pl-9 text-sm outline-none focus:border-[#071a78] sm:w-64"
							/>
						</div>
						<select
							value={status}
							onChange={(e) => {
								setStatus(
									e.target.value as
										| ""
										| "PENDING"
										| "SUCCESS"
										| "FAILED"
										| "REFUNDED",
								);
								setPage(1);
							}}
							className="h-10 rounded-lg border border-[#dbe7ff] bg-white px-3 text-sm outline-none focus:border-[#071a78]"
						>
							<option value="">All Status</option>
							<option value="SUCCESS">Success</option>
							<option value="PENDING">Pending</option>
							<option value="FAILED">Failed</option>
							<option value="REFUNDED">Refunded</option>
						</select>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-[#dbe7ff] bg-white p-5">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm">Total Spent</p>
							<p className="mt-1 font-bold text-2xl text-[#071a78]">
								₹{stats.totalSpent.toLocaleString("en-IN")}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
							<TrendingUp className="h-5 w-5" />
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-[#dbe7ff] bg-white p-5">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm">Successful</p>
							<p className="mt-1 font-bold text-2xl text-emerald-600">
								{stats.successCount}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
							<ShieldCheck className="h-5 w-5" />
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-[#dbe7ff] bg-white p-5">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm">Pending</p>
							<p className="mt-1 font-bold text-2xl text-amber-600">
								{stats.pendingCount}
							</p>
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
							<CreditCard className="h-5 w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Payments List */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-[#dbe7ff] border-b bg-slate-50/50">
								<th className="px-6 py-4 text-left font-semibold text-[#071a78] text-xs uppercase tracking-wider">
									Reference
								</th>
								<th className="px-6 py-4 text-left font-semibold text-[#071a78] text-xs uppercase tracking-wider">
									Amount
								</th>
								<th className="px-6 py-4 text-left font-semibold text-[#071a78] text-xs uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-4 text-left font-semibold text-[#071a78] text-xs uppercase tracking-wider">
									Transaction ID
								</th>
								<th className="px-6 py-4 text-left font-semibold text-[#071a78] text-xs uppercase tracking-wider">
									Date
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{filteredPayments.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center">
										<p className="text-slate-500">No payments found</p>
									</td>
								</tr>
							) : (
								filteredPayments.map((payment) => (
									<tr key={payment.id} className="hover:bg-slate-50/50">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
													<Banknote className="h-4 w-4 text-slate-500" />
												</div>
												<span className="font-mono text-slate-900 text-sm">
													{payment.id.slice(-8).toUpperCase()}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<p className="font-semibold text-slate-900">
												₹{payment.amount.toLocaleString("en-IN")}
											</p>
										</td>
										<td className="px-6 py-4">
											<Badge
												variant="outline"
												className={cn(
													"capitalize",
													statusStyles[payment.status] ?? statusStyles.REFUNDED,
												)}
											>
												{payment.status.toLowerCase()}
											</Badge>
										</td>
										<td className="px-6 py-4">
											<p className="font-mono text-slate-500 text-sm">
												{payment.transactionId || "-"}
											</p>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2 text-slate-600">
												<Calendar className="h-4 w-4" />
												<span className="text-sm">
													{format(new Date(payment.createdAt), "dd MMM yyyy")}
												</span>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{paymentsQuery.data?.meta && paymentsQuery.data.meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-[#dbe7ff] border-t px-6 py-4">
						<p className="text-slate-500 text-sm">
							Page {paymentsQuery.data.meta.page} of{" "}
							{paymentsQuery.data.meta.totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage(page - 1)}
								disabled={!paymentsQuery.data.meta.hasPreviousPage}
								className="rounded-lg border border-[#dbe7ff] px-3 py-1.5 text-sm disabled:opacity-50"
							>
								Previous
							</button>
							<button
								type="button"
								onClick={() => setPage(page + 1)}
								disabled={!paymentsQuery.data.meta.hasNextPage}
								className="rounded-lg border border-[#dbe7ff] px-3 py-1.5 text-sm disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function PaymentsPage() {
	return (
		<ProtectedRoute>
			<PaymentsPageContent />
		</ProtectedRoute>
	);
}
