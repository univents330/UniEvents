"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowUpRight,
	Banknote,
	Calendar,
	CreditCard,
	Download,
	Search,
	ShieldCheck,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/core/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { usePayments } from "../hooks/use-payments";
import type { PaymentRecord } from "../services/payments.service";

const statusVariant: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	PENDING: "outline",
	SUCCESS: "secondary",
	FAILED: "destructive",
	REFUNDED: "default",
};

export function PaymentsView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<
		"PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | ""
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

	const columns = useMemo<ColumnDef<PaymentRecord>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Reference Stream",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-100 bg-slate-50 shadow-sm">
							<Banknote size={16} className="text-slate-400" />
						</div>
						<div className="flex flex-col">
							<span className="font-black font-mono text-slate-900 text-xs tracking-tighter">
								PAY-{row.original.id.slice(-8).toUpperCase()}
							</span>
							<span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
								{row.original.gateway || "CORE_GATEWAY"}
							</span>
						</div>
					</div>
				),
			},
			{
				accessorKey: "amount",
				header: "Financial Volume",
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-black text-slate-900 text-sm uppercase tracking-tighter">
							{new Intl.NumberFormat("en-IN", {
								style: "currency",
								currency: row.original.currency,
								maximumFractionDigits: 0,
							}).format(row.original.amount)}
						</span>
						<div className="flex items-center gap-1 font-black text-[8px] text-emerald-600 uppercase tracking-widest">
							<TrendingUp size={8} /> Verified Settlement
						</div>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "Settlement Status",
				cell: ({ row }) => (
					<Badge
						variant={statusVariant[row.original.status] ?? "default"}
						className="rounded-none border-none px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] shadow-sm"
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "transactionId",
				header: "Network Identifier",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<span className="font-bold font-mono text-[10px] text-slate-500 tracking-tight">
							{row.original.transactionId
								? row.original.transactionId.toUpperCase()
								: "UNSET_PROTOCOL"}
						</span>
					</div>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Timestamp",
				cell: ({ row }) => (
					<div className="flex items-center gap-2 text-slate-600">
						<Calendar size={14} className="opacity-30" />
						<span className="font-black text-slate-900 text-xs uppercase tracking-tighter">
							{format(new Date(row.original.createdAt), "dd MMM yyyy")}
						</span>
					</div>
				),
			},
			{
				id: "actions",
				header: "",
				cell: () => (
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							className="h-8 w-8 rounded-none border border-slate-100 bg-slate-50 p-0 text-slate-400 transition-all hover:bg-slate-900 hover:text-white"
						>
							<Download size={14} />
						</Button>
						<Button
							variant="ghost"
							className="group h-8 w-8 rounded-none border border-slate-100 bg-slate-50 p-0 transition-all hover:bg-[#030370] hover:text-white"
						>
							<ArrowUpRight
								size={14}
								className="text-slate-400 group-hover:text-white"
							/>
						</Button>
					</div>
				),
			},
		],
		[],
	);

	return (
		<div className="fade-in animate-in space-y-1 pb-20 duration-500">
			{/* Top Bar - Sharp Header */}
			<div className="flex flex-col justify-between gap-6 border border-[#dbe7ff] bg-white p-4 sm:p-8 xl:flex-row xl:items-end">
				<div className="space-y-2 text-center sm:text-left">
					<span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
						Financial History
					</span>
					<h2 className="font-black text-2xl text-[#071a78] uppercase tracking-tighter sm:text-3xl">
						My Payments
					</h2>
					<p className="max-w-xl font-bold text-slate-400 text-xs sm:text-sm">
						View all your successful transactions, pending payments, and
						historical spending logs.
					</p>
				</div>

				<div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
					<div className="relative w-full md:w-72">
						<Search
							className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
							size={16}
						/>
						<Input
							placeholder="Reference lookup..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-10 w-full rounded-none border-[#dbe7ff] bg-white pl-11 font-black text-[10px] uppercase tracking-widest shadow-sm sm:h-12 sm:text-xs"
						/>
					</div>

					<div className="flex w-full items-center gap-3 border border-[#dbe7ff] bg-white p-1 shadow-sm md:w-auto">
						<Select
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
							className="h-8 min-w-[120px] rounded-none border-none bg-slate-50 font-black text-[9px] text-slate-500 uppercase tracking-widest sm:min-w-[140px] sm:text-[10px]"
						>
							<option value="">All Settlement Streams</option>
							<option value="SUCCESS">Success</option>
							<option value="PENDING">Pending</option>
							<option value="FAILED">Failed</option>
							<option value="REFUNDED">Refunded</option>
						</Select>
					</div>
				</div>
			</div>

			{/* Financial Summary Matrix - Sharp */}
			<div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-1">
				<PaymentMetric
					label="Total Volume"
					value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
					icon={<TrendingUp size={20} />}
					accent="blue"
				/>
				<PaymentMetric
					label="Verified Settlements"
					value={stats.successCount}
					icon={<ShieldCheck size={20} />}
					accent="green"
				/>
				<PaymentMetric
					label="Pending Protocol"
					value={stats.pendingCount}
					icon={<CreditCard size={20} />}
					accent="amber"
				/>
			</div>

			{/* Desktop Table View */}
			<div className="hidden overflow-hidden border border-[#dbe7ff] bg-white shadow-sm md:block">
				<DataTable
					columns={columns}
					data={paymentsQuery.data?.data ?? []}
					meta={paymentsQuery.data?.meta}
					onPageChange={setPage}
					isLoading={paymentsQuery.isLoading}
				/>
			</div>

			{/* Mobile Card View */}
			<div className="space-y-2 md:hidden">
				{paymentsQuery.isLoading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="h-32 animate-pulse border border-[#dbe7ff] bg-white"
						/>
					))
				) : paymentsQuery.data?.data.length === 0 ? (
					<div className="border border-[#dbe7ff] border-dashed bg-white py-12 text-center">
						<p className="px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">
							No matches found in database
						</p>
					</div>
				) : (
					paymentsQuery.data?.data.map((payment: PaymentRecord) => (
						<div
							key={payment.id}
							className="space-y-4 border border-[#dbe7ff] bg-white p-4 shadow-sm"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-100 bg-white shadow-xs">
										<Banknote size={18} className="text-slate-400" />
									</div>
									<div className="min-w-0">
										<p className="font-black text-slate-900 text-sm tracking-tighter">
											₹{payment.amount.toLocaleString("en-IN")}
										</p>
										<p className="font-black font-mono text-[8px] text-slate-400 uppercase tracking-widest">
											PAY-{payment.id.slice(-8).toUpperCase()}
										</p>
									</div>
								</div>
								<Badge
									variant={statusVariant[payment.status] ?? "default"}
									className="shrink-0 border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest"
								>
									{payment.status}
								</Badge>
							</div>

							<div className="flex items-center justify-between border-slate-50 border-t pt-3">
								<div className="flex items-center gap-2 text-slate-500">
									<Calendar size={10} className="opacity-40" />
									<span className="font-black text-[8px] uppercase tracking-widest">
										{format(new Date(payment.createdAt), "dd MMM yyyy")}
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<ShieldCheck size={10} className="text-emerald-500" />
									<span className="font-black text-[8px] text-slate-400 uppercase tracking-[0.1em]">
										Verified
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function PaymentMetric({
	label,
	value,
	icon,
	accent,
}: {
	label: string;
	value: number | string;
	icon: React.ReactNode;
	accent: string;
}) {
	const accents: Record<string, string> = {
		blue: "bg-blue-50/50 text-blue-600 border-blue-100",
		green: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
		amber: "bg-amber-50/50 text-amber-600 border-amber-100",
	};

	return (
		<div className="group flex items-center justify-between border border-[#dbe7ff] bg-white p-4 transition-all hover:bg-slate-50 sm:p-6">
			<div>
				<p className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">
					{label}
				</p>
				<p className="mt-1 font-black text-slate-900 text-xl uppercase tracking-tighter sm:text-2xl">
					{value}
				</p>
			</div>
			<div
				className={cn(
					"flex h-10 w-10 items-center justify-center border shadow-inner transition-all group-hover:rotate-12 sm:h-12 sm:w-12",
					accents[accent],
				)}
			>
				{icon}
			</div>
		</div>
	);
}
