"use client";

import {
	CircleDollarSign,
	ClipboardList,
	Plus,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import { useEvents } from "@/modules/events";
import { useOrders } from "@/modules/orders";
import { usePayments } from "@/modules/payments";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

// Loading skeleton component
function MetricCardSkeleton() {
	return (
		<div className="border border-[#dbe7ff] bg-white p-6">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="h-4 w-24 animate-pulse bg-slate-100" />
					<div className="mt-2 h-8 w-20 animate-pulse bg-slate-100" />
					<div className="mt-2 h-3 w-32 animate-pulse bg-slate-100" />
				</div>
				<div className="h-10 w-10 animate-pulse border border-slate-100 bg-slate-50" />
			</div>
		</div>
	);
}

function _StatusCardSkeleton() {
	return (
		<div className="border border-[#dbe7ff] bg-slate-50 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="h-4 w-16 animate-pulse bg-slate-100" />
					<div className="mt-1 h-8 w-12 animate-pulse bg-slate-100" />
				</div>
				<div className="h-3.5 w-3.5 animate-pulse border border-slate-100 bg-slate-50" />
			</div>
		</div>
	);
}

export function HostDashboard() {
	const { user } = useAuth();
	const userId = user?.id;

	const hostEventsQuery = useEvents({ userId, limit: 100 });
	const userOrdersQuery = useOrders({ limit: 100 });
	const userPaymentsQuery = usePayments({ limit: 100, status: "SUCCESS" });
	const analyticsQuery = useDashboardAnalytics({ groupBy: "day", userId });

	const hostEvents = hostEventsQuery.data?.data ?? [];
	const hostEventIds = useMemo(() => hostEvents.map((e) => e.id), [hostEvents]);
	const orders = useMemo(
		() =>
			(userOrdersQuery.data?.data ?? []).filter((order) =>
				hostEventIds.includes(order.eventId),
			),
		[userOrdersQuery.data?.data, hostEventIds],
	);
	const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);
	const payments = useMemo(
		() =>
			(userPaymentsQuery.data?.data ?? []).filter((payment) =>
				orderIds.includes(payment.orderId),
			),
		[userPaymentsQuery.data?.data, orderIds],
	);
	const attendeesCount =
		analyticsQuery.attendeesQuery.data?.totalAttendees ?? 0;

	const draftEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "DRAFT").length,
		[hostEvents],
	);
	const publishedEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "PUBLISHED").length,
		[hostEvents],
	);
	const completedEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "COMPLETED").length,
		[hostEvents],
	);
	const cancelledEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "CANCELLED").length,
		[hostEvents],
	);

	const pendingOrdersTotal = orders.filter(
		(o) => o.status === "PENDING",
	).length;
	const completedOrdersTotal = orders.filter(
		(o) => o.status === "COMPLETED",
	).length;
	const cancelledOrdersTotal = orders.filter(
		(o) => o.status === "CANCELLED",
	).length;

	const activeOrdersTotal = pendingOrdersTotal + completedOrdersTotal;

	const conversionRate =
		pendingOrdersTotal + completedOrdersTotal > 0
			? (completedOrdersTotal / (pendingOrdersTotal + completedOrdersTotal)) *
				100
			: 0;

	const revenue = useMemo(() => {
		return payments.reduce((acc, p) => acc + (p.amount ?? 0), 0);
	}, [payments]);

	const orderStatusPieData = useMemo(() => {
		return [
			{ name: "Pending", value: pendingOrdersTotal, color: "#f59e0b" },
			{ name: "Completed", value: completedOrdersTotal, color: "#10b981" },
			{ name: "Cancelled", value: cancelledOrdersTotal, color: "#ef4444" },
		];
	}, [pendingOrdersTotal, completedOrdersTotal, cancelledOrdersTotal]);

	const isMetricsLoading =
		hostEventsQuery.isLoading ||
		userOrdersQuery.isLoading ||
		userPaymentsQuery.isLoading ||
		analyticsQuery.isLoading;

	return (
		<div className="fade-in w-full max-w-full animate-in space-y-1 overflow-x-hidden pb-20 duration-500">
			{/* Welcome Banner - Sharp Header */}
			<div className="group relative overflow-hidden border border-[#dbe7ff] bg-white p-6 sm:p-10">
				<div className="absolute top-0 right-0 p-10 opacity-5 transition-transform duration-700 group-hover:scale-110">
					<Zap size={160} className="hidden sm:block" />
				</div>
				<div className="relative z-10 flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
					<div className="space-y-2 text-center md:text-left">
						<span className="font-black text-[#030370] text-[10px] uppercase tracking-[0.4em]">
							Host Control
						</span>
						<h2 className="font-black text-2xl text-[#071a78] uppercase tracking-tighter sm:text-3xl">
							Operational Dashboard
						</h2>
						<p className="max-w-xl font-bold text-slate-400 text-xs sm:text-sm">
							Monitor event performance, track attendee deployments, and manage
							revenue streams with precision.
						</p>
					</div>
					<Link
						href="/dashboard/events/create"
						className="flex h-12 w-full items-center justify-center gap-3 bg-[#030370] px-8 font-black text-[10px] text-white! uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-slate-900 active:scale-95 sm:h-14 md:w-auto"
					>
						<Plus className="h-4 w-4" />
						Initiate New Event
					</Link>
				</div>
			</div>

			{/* Key Metrics Matrix - Sharp */}
			<div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
				{isMetricsLoading ? (
					<>
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
					</>
				) : (
					<>
						<MetricCard
							icon={<Zap className="h-5 w-5" />}
							label="Total Events"
							value={hostEvents.length}
							subLabel="Global Inventory"
							accent="blue"
						/>
						<MetricCard
							icon={<Users className="h-5 w-5" />}
							label="Attendees"
							value={attendeesCount}
							subLabel="Verified Deployment"
							accent="green"
						/>
						<MetricCard
							icon={<ClipboardList className="h-5 w-5" />}
							label="Active Orders"
							value={activeOrdersTotal}
							subLabel={`Conv. Rate: ${conversionRate.toFixed(1)}%`}
							accent="amber"
						/>
						<MetricCard
							icon={<CircleDollarSign className="h-5 w-5" />}
							label="Total Revenue"
							value={new Intl.NumberFormat("en-IN", {
								style: "currency",
								currency: "INR",
								maximumFractionDigits: 0,
							}).format(revenue)}
							subLabel="Settled Settlements"
							accent="violet"
						/>
					</>
				)}
			</div>

			{/* Charts + overview - Sharp Grid */}
			<div className="grid grid-cols-1 gap-1 lg:grid-cols-3">
				<div className="border border-[#dbe7ff] bg-white p-8 lg:col-span-1">
					<div className="mb-6 border-slate-100 border-b pb-6">
						<h3 className="font-black text-[#071a78] text-lg uppercase tracking-tight">
							Order Pipeline
						</h3>
						<p className="mt-1 font-black text-[10px] text-slate-400 uppercase tracking-widest">
							Current transaction status
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

				<div className="space-y-1 lg:col-span-2">
					<div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
						<StatusCard
							label="Draft Protocol"
							value={draftEventsTotal}
							color="#3b82f6"
						/>
						<StatusCard
							label="Live Deployment"
							value={publishedEventsTotal}
							color="#0a4bb8"
						/>
						<StatusCard
							label="Completed Ops"
							value={completedEventsTotal}
							color="#8b5cf6"
						/>
						<StatusCard
							label="Aborted Ops"
							value={cancelledEventsTotal}
							color="#ef4444"
						/>
					</div>

					<div className="border border-[#dbe7ff] bg-white p-8">
						<div className="mb-6 border-slate-100 border-b pb-6">
							<h3 className="font-black text-[#071a78] text-lg uppercase tracking-tight">
								Dashboard Focus
							</h3>
							<p className="mt-1 font-black text-[10px] text-slate-400 uppercase tracking-widest">
								Operational Guidance
							</p>
						</div>
						<p className="font-bold text-slate-400 text-sm leading-relaxed">
							Use the Events page to manage event records. This dashboard stays
							focused on real-time analytics, order processing, and the overall
							health of your operational assets.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	icon,
	label,
	value,
	subLabel,
	accent,
}: {
	icon: ReactNode;
	label: string;
	value: number | string | null;
	subLabel: string;
	accent: "blue" | "green" | "amber" | "violet";
}) {
	const styles = {
		blue: {
			bg: "bg-blue-50/30 border-blue-100",
			text: "text-blue-600",
		},
		green: {
			bg: "bg-emerald-50/30 border-emerald-100",
			text: "text-emerald-600",
		},
		amber: {
			bg: "bg-amber-50/30 border-amber-100",
			text: "text-amber-600",
		},
		violet: {
			bg: "bg-violet-50/30 border-violet-100",
			text: "text-violet-600",
		},
	}[accent];

	return (
		<div
			className={cn(
				"border bg-white p-6 transition-all hover:bg-slate-50",
				styles.bg,
			)}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
						{label}
					</p>
					<p className="mt-2 font-black text-2xl text-slate-900 tracking-tighter">
						{value === null ? "-" : value}
					</p>
					<p className="mt-1 font-bold text-[10px] text-slate-400 uppercase tracking-tight">
						{subLabel}
					</p>
				</div>
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center border border-white bg-white shadow-sm",
						styles.text,
					)}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}

function LegendRow({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: string;
}) {
	return (
		<div className="flex items-center justify-between border border-slate-50 bg-[#f8fafc] px-3 py-2">
			<div className="flex items-center gap-3">
				<div className="h-2 w-2" style={{ backgroundColor: color }} />
				<span className="font-black text-[10px] text-slate-500 uppercase tracking-widest">
					{label}
				</span>
			</div>
			<span className="font-black text-slate-900 text-xs">
				{value.toLocaleString("en-IN")}
			</span>
		</div>
	);
}

function StatusCard({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: string;
}) {
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
						{value.toLocaleString("en-IN")}
					</span>
				</div>
			</div>
		</div>
	);
}
