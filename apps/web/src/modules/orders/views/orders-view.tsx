"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowUpRight,
	Calendar,
	Check,
	Loader2,
	Search,
	ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useEvents } from "@/modules/events";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useOrders } from "../hooks/use-orders";
import type { OrderRecord } from "../services/orders.service";

const statusVariant: Record<
	string,
	"default" | "success" | "warning" | "destructive"
> = {
	PENDING: "warning",
	COMPLETED: "success",
	CANCELLED: "destructive",
};

export function OrdersView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<
		"PENDING" | "COMPLETED" | "CANCELLED" | ""
	>("");
	const [searchQuery, setSearchQuery] = useState("");

	const ordersQuery = useOrders({
		page,
		limit: 10,
		status: status || undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const eventsQuery = useEvents({ limit: 100 });
	const events = eventsQuery.data?.data ?? [];

	const eventMap = useMemo(() => {
		const map = new Map();
		for (const e of events) map.set(e.id, e);
		return map;
	}, [events]);

	const columns = useMemo<ColumnDef<OrderRecord>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Record Reference",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-100 bg-slate-50">
							<ShoppingBag size={16} className="text-slate-400" />
						</div>
						<div className="flex flex-col">
							<span className="font-black font-mono text-slate-900 text-xs tracking-tighter">
								ORD-{row.original.id.slice(-8).toUpperCase()}
							</span>
							<span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
								Protocol Ledger
							</span>
						</div>
					</div>
				),
			},
			{
				accessorKey: "eventId",
				header: "Operational Asset",
				cell: ({ row }) => {
					const event = eventMap.get(row.original.eventId);
					return (
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-slate-50">
								{event?.thumbnail ? (
									<Image
										src={event.thumbnail}
										alt={event.name}
										width={40}
										height={40}
										className="h-full w-full object-cover"
									/>
								) : (
									<ShoppingBag className="text-slate-200" size={18} />
								)}
							</div>
							<div className="min-w-0 max-w-[200px]">
								<p className="truncate font-black text-slate-900 text-sm uppercase tracking-tight">
									{event?.name || "Loading..."}
								</p>
								<p className="truncate font-black text-[9px] text-slate-400 uppercase tracking-widest">
									Venue
								</p>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Operational Status",
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
				accessorKey: "createdAt",
				header: "Time Stamp",
				cell: ({ row }) => (
					<div className="flex items-center gap-2 text-slate-600">
						<Calendar size={14} className="opacity-30" />
						<div className="flex flex-col">
							<span className="font-black text-slate-900 text-xs uppercase tracking-tighter">
								{format(new Date(row.original.createdAt), "dd MMM yyyy")}
							</span>
							<span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
								{format(new Date(row.original.createdAt), "HH:mm")}
							</span>
						</div>
					</div>
				),
			},
			{
				id: "actions",
				header: "",
				cell: () => (
					<div className="flex justify-end">
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-none border border-slate-100 bg-slate-50 p-0 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
						>
							<ArrowUpRight size={16} />
						</Button>
					</div>
				),
			},
		],
		[eventMap],
	);

	return (
		<div className="fade-in animate-in space-y-1 pb-20 duration-500">
			{/* Top Bar - Sharp Header */}
			<div className="flex flex-col justify-between gap-6 border border-[#dbe7ff] bg-white p-8 xl:flex-row xl:items-end">
				<div className="space-y-2">
					<span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
						Order History
					</span>
					<h2 className="font-black text-3xl text-[#071a78] uppercase tracking-tighter">
						My Orders
					</h2>
					<p className="max-w-xl font-bold text-slate-400 text-sm">
						Track your ticket purchases, order status, and complete transaction
						history.
					</p>
				</div>

				<div className="flex flex-col items-center gap-4 md:flex-row">
					<div className="relative w-full md:w-72">
						<Search
							className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
							size={16}
						/>
						<Input
							placeholder="Reference lookup..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-12 rounded-none border-[#dbe7ff] bg-white pl-11 font-black text-xs uppercase tracking-widest shadow-sm"
						/>
					</div>

					<div className="flex w-full items-center gap-3 border border-[#dbe7ff] bg-white p-1.5 shadow-sm md:w-auto">
						<Select
							value={status}
							onChange={(e) => {
								setStatus(
									e.target.value as "" | "PENDING" | "CANCELLED" | "COMPLETED",
								);
								setPage(1);
							}}
							className="h-9 min-w-[140px] rounded-none border-none bg-slate-50 font-black text-[10px] text-slate-500 uppercase tracking-widest"
						>
							<option value="">All Streams</option>
							<option value="PENDING">Pending</option>
							<option value="COMPLETED">Completed</option>
							<option value="CANCELLED">Cancelled</option>
						</Select>
					</div>
				</div>
			</div>

			{/* Quick Stats Matrix - Sharp */}
			<div className="grid grid-cols-1 gap-1 md:grid-cols-3">
				<QuickStat
					label="Total Orders"
					value={ordersQuery.data?.meta.total ?? 0}
					icon={<ShoppingBag size={20} />}
					accent="blue"
				/>
				<QuickStat
					label="Completed"
					value={
						ordersQuery.data?.data.filter(
							(o: OrderRecord) => o.status === "COMPLETED",
						).length ?? 0
					}
					icon={<Check size={20} />}
					accent="green"
				/>
				<QuickStat
					label="Processing"
					value={
						ordersQuery.data?.data.filter(
							(o: OrderRecord) => o.status === "PENDING",
						).length ?? 0
					}
					icon={<Loader2 size={20} className="animate-spin" />}
					accent="amber"
				/>
			</div>

			<div className="overflow-hidden border border-[#dbe7ff] bg-white shadow-sm">
				<DataTable
					columns={columns}
					data={ordersQuery.data?.data ?? []}
					meta={ordersQuery.data?.meta}
					onPageChange={setPage}
					isLoading={ordersQuery.isLoading || eventsQuery.isLoading}
				/>
			</div>
		</div>
	);
}

function QuickStat({
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
		<div className="group flex items-center justify-between border border-[#dbe7ff] bg-white p-6 transition-all hover:bg-slate-50">
			<div>
				<p className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">
					{label}
				</p>
				<p className="mt-1 font-black text-2xl text-slate-900 uppercase tracking-tighter">
					{value}
				</p>
			</div>
			<div
				className={cn(
					"flex h-12 w-12 items-center justify-center border shadow-inner transition-transform group-hover:scale-110",
					accents[accent],
				)}
			>
				{icon}
			</div>
		</div>
	);
}
