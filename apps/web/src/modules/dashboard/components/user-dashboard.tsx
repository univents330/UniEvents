"use client";

import { ChevronRight, CreditCard, Ticket, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import { useOrders } from "@/modules/orders";
import { usePayments } from "@/modules/payments";
import { useTickets } from "@/modules/tickets";

interface MetricCardProps {
	icon: ReactNode;
	label: string;
	value: number | string | null;
	subLabel?: string;
	accent: "blue" | "green" | "amber" | "violet";
	isLoading?: boolean;
}

function MetricCard({
	icon,
	label,
	value,
	subLabel,
	accent,
	isLoading,
}: MetricCardProps) {
	const bgColors = {
		blue: "bg-blue-50/30 border-blue-100",
		green: "bg-emerald-50/30 border-emerald-100",
		amber: "bg-amber-50/30 border-amber-100",
		violet: "bg-violet-50/30 border-violet-100",
	};

	const iconColors = {
		blue: "text-blue-600",
		green: "text-emerald-600",
		amber: "text-amber-600",
		violet: "text-violet-600",
	};

	return (
		<div
			className={cn(
				"border bg-white p-6 transition-all hover:bg-slate-50",
				bgColors[accent],
			)}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
						{label}
					</p>
					<p className="mt-2 font-black text-2xl text-slate-900 tracking-tighter">
						{isLoading ? "..." : value === null ? "-" : value}
					</p>
					{subLabel && (
						<p className="mt-1 font-bold text-[10px] text-slate-400 uppercase tracking-tight">
							{subLabel}
						</p>
					)}
				</div>
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center border border-white bg-white shadow-sm",
						iconColors[accent],
					)}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}

interface LegendRowProps {
	label: string;
	value: number;
	color: string;
}

function LegendRow({ label, value, color }: LegendRowProps) {
	return (
		<div className="flex items-center justify-between border border-slate-50 bg-[#f8fafc] px-3 py-2">
			<div className="flex items-center gap-3">
				<div className="h-2 w-2" style={{ backgroundColor: color }} />
				<span className="font-black text-[10px] text-slate-500 uppercase tracking-widest">
					{label}
				</span>
			</div>
			<span className="font-black text-slate-900 text-xs">{value}</span>
		</div>
	);
}

interface StatusCardProps {
	label: string;
	value: number;
	color: string;
}

function StatusCard({ label, value, color }: StatusCardProps) {
	return (
		<div className="group border border-[#dbe7ff] bg-white p-5 transition-all hover:bg-slate-50">
			<div className="flex items-center justify-between">
				<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
					{label}
				</p>
				<div
					className="flex h-10 w-10 items-center justify-center border border-slate-100 transition-transform group-hover:scale-110"
					style={{ backgroundColor: `${color}10` }}
				>
					<span className="font-black text-lg" style={{ color }}>
						{value}
					</span>
				</div>
			</div>
		</div>
	);
}

export function UserDashboard() {
	const { user } = useAuth();

	const userOrdersQuery = useOrders({ limit: 100 });
	const userTicketsQuery = useTickets({ limit: 100 });
	const userPaymentsQuery = usePayments({ limit: 100, status: "SUCCESS" });

	const tickets = userTicketsQuery.data?.data ?? [];
	const orders = userOrdersQuery.data?.data ?? [];
	const payments = userPaymentsQuery.data?.data ?? [];

	const totalTickets = tickets.length;
	const totalOrders = orders.length;
	const totalEventsBooked = useMemo(
		() => new Set(tickets.map((t) => t.eventId)).size,
		[tickets],
	);

	const totalSpent = useMemo(() => {
		return payments.reduce((acc, p) => acc + (p.amount ?? 0), 0);
	}, [payments]);

	const orderStatusPieData = useMemo(() => {
		const pending = orders.filter((o) => o.status === "PENDING").length;
		const completed = orders.filter((o) => o.status === "COMPLETED").length;
		const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

		return [
			{ name: "Pending", value: pending, color: "#f59e0b" },
			{ name: "Completed", value: completed, color: "#10b981" },
			{ name: "Cancelled", value: cancelled, color: "#ef4444" },
		];
	}, [orders]);

	const isMetricsLoading =
		userOrdersQuery.isLoading ||
		userTicketsQuery.isLoading ||
		userPaymentsQuery.isLoading;

	return (
		<div className="fade-in animate-in space-y-1 pb-20 duration-500">
			{/* Welcome Banner - Sharp Header */}
			<div className="group relative overflow-hidden rounded-xl border border-[#dbe7ff] bg-white p-10">
				<div className="absolute top-0 right-0 p-10 opacity-5 transition-transform duration-700 group-hover:scale-110">
					<Users size={160} />
				</div>
				<div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
					<div className="space-y-2">
						<span className="font-black text-[#030370] text-[10px] uppercase tracking-[0.4em]">
							Your Account
						</span>
						<h2 className="font-black text-3xl text-[#071a78] uppercase tracking-tighter">
							Welcome, {user?.name?.split(" ")[0] || "User"}
						</h2>
						<p className="max-w-xl font-bold text-slate-400 text-sm">
							Manage your upcoming event tickets, track your orders, and view
							your payment history.
						</p>
					</div>
					<Link
						href="/tickets"
						className="flex h-14 items-center justify-center gap-3 rounded-lg bg-[#030370] px-8 font-black text-[10px] text-white! uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-slate-900 active:scale-95"
					>
						<Ticket className="h-4 w-4" />
						View My Tickets
					</Link>
				</div>
			</div>

			{/* Key Metrics Matrix - Sharp */}
			<div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					icon={<Ticket className="h-5 w-5" />}
					label="Active Passes"
					value={totalTickets}
					subLabel="Allocated Digital Assets"
					accent="blue"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<CreditCard className="h-5 w-5" />}
					label="Recent Orders"
					value={totalOrders}
					subLabel="Orders Placed"
					accent="green"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<Users className="h-5 w-5" />}
					label="Deployment Points"
					value={totalEventsBooked}
					subLabel="Verified Event Venues"
					accent="amber"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<CreditCard className="h-5 w-5" />}
					label="Lifetime Volume"
					value={`₹${totalSpent.toLocaleString("en-IN")}`}
					subLabel="Settled Transactions"
					accent="violet"
					isLoading={isMetricsLoading}
				/>
			</div>

			{/* Charts + overview - Sharp Grid */}
			<div className="grid grid-cols-1 gap-1 lg:grid-cols-3">
				<div className="rounded-xl border border-[#dbe7ff] bg-white p-8 lg:col-span-1">
					<div className="mb-6 border-slate-100 border-b pb-6">
						<h3 className="font-black text-[#071a78] text-lg uppercase tracking-tight">
							Order Status
						</h3>
						<p className="mt-1 font-black text-[10px] text-slate-400 uppercase tracking-widest">
							Current status of your tickets
						</p>
					</div>

					<div className="relative h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip
									contentStyle={{
										borderRadius: "0px",
										border: "1px solid #dbe7ff",
										boxShadow: "0 10px 30px rgba(3,3,112,0.1)",
										fontSize: "10px",
										fontWeight: "900",
										textTransform: "uppercase",
									}}
								/>
								<Pie
									data={orderStatusPieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={85}
									paddingAngle={2}
									stroke="none"
								>
									{orderStatusPieData.map((entry) => (
										<Cell key={entry.name} fill={entry.color} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>

					<div className="mt-6 space-y-1">
						{orderStatusPieData.map((d) => (
							<LegendRow
								key={d.name}
								label={d.name}
								value={d.value}
								color={d.color}
							/>
						))}
					</div>
				</div>

				<div className="space-y-1 overflow-hidden rounded-xl lg:col-span-2">
					<div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
						<StatusCard
							label="Pending Registry"
							value={orderStatusPieData[0].value}
							color="#f59e0b"
						/>
						<StatusCard
							label="Verified Complete"
							value={orderStatusPieData[1].value}
							color="#10b981"
						/>
						<StatusCard
							label="Asset Deployment"
							value={totalEventsBooked}
							color="#8b5cf6"
						/>
						<StatusCard
							label="Aborted Sessions"
							value={orderStatusPieData[2].value}
							color="#ef4444"
						/>
					</div>

					<div className="h-full rounded-xl border border-[#dbe7ff] bg-white p-8">
						<div className="mb-6 border-slate-100 border-b pb-6">
							<h3 className="font-black text-[#071a78] text-lg uppercase tracking-tight">
								Quick Links
							</h3>
							<p className="mt-1 font-black text-[10px] text-slate-400 uppercase tracking-widest">
								Fast navigation
							</p>
						</div>

						<div className="grid grid-cols-1 gap-1 md:grid-cols-3">
							<QuickActionItem
								href="/tickets"
								title="My Tickets"
								desc="View your passes"
							/>
							<QuickActionItem
								href="/orders"
								title="Orders"
								desc="View history"
							/>
							<QuickActionItem
								href="/payments"
								title="Payments"
								desc="Check history"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function QuickActionItem({
	href,
	title,
	desc,
}: {
	href: string;
	title: string;
	desc: string;
}) {
	return (
		<Link
			href={href}
			className="group block border border-slate-100 bg-[#f8fafc] p-6 transition-all hover:border-blue-200 hover:bg-slate-50"
		>
			<div className="flex flex-col gap-4">
				<div className="flex h-10 w-10 items-center justify-center border border-slate-100 bg-white shadow-sm transition-all group-hover:bg-[#030370] group-hover:text-white">
					<ChevronRight
						size={16}
						className="transition-transform group-hover:translate-x-1"
					/>
				</div>
				<div>
					<p className="font-black text-slate-900 text-xs uppercase tracking-widest transition-colors group-hover:text-[#030370]">
						{title}
					</p>
					<p className="mt-1 font-bold text-[10px] text-slate-500 uppercase tracking-tight opacity-60">
						{desc}
					</p>
				</div>
			</div>
		</Link>
	);
}
