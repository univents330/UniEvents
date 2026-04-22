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
import { useAuth } from "@/core/providers/auth-provider";
import { useEvents } from "@/modules/events";
import { useOrders } from "@/modules/orders";
import { usePayments } from "@/modules/payments";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

// Loading skeleton component
function MetricCardSkeleton() {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
					<div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200" />
					<div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-200" />
				</div>
				<div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />
			</div>
		</div>
	);
}

function StatusCardSkeleton() {
	return (
		<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
					<div className="mt-1 h-8 w-12 animate-pulse rounded bg-slate-200" />
				</div>
				<div className="h-3.5 w-3.5 animate-pulse rounded-full bg-slate-200" />
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
	const allEventsTotal = hostEvents.length;

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
		<div className="space-y-8">
			{/* Create Event (home first) */}
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-gradient-to-br from-[#030370]/5 via-white to-[#245ed1]/5 p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="min-w-0">
						<h2 className="font-bold text-[#071a78] text-xl">
							Create your next event
						</h2>
						<p className="mt-1 text-slate-600">
							Create and manage your events from one place.
						</p>
					</div>
					<Link
						href="/events/create"
						className="!text-white inline-flex items-center justify-center gap-2 rounded-xl bg-[#030370] px-5 py-3 font-semibold shadow-[0_14px_40px_rgba(3,3,112,0.25)] transition-colors hover:bg-[#030370]/90"
					>
						<Plus className="h-5 w-5" />
						Create event
					</Link>
				</div>
			</div>

			{/* Key metrics */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
							value={allEventsTotal}
							subLabel="Draft + Published + Completed"
							accent="blue"
						/>
						<MetricCard
							icon={<Users className="h-5 w-5" />}
							label="Total Attendees"
							value={attendeesCount}
							subLabel="Across your host events"
							accent="green"
						/>
						<MetricCard
							icon={<ClipboardList className="h-5 w-5" />}
							label="Active Orders"
							value={activeOrdersTotal}
							subLabel={`Conversion: ${conversionRate.toFixed(1)}%`}
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
							subLabel="Successful payments only"
							accent="violet"
						/>
					</>
				)}
			</div>

			{/* Charts + event overview */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 lg:col-span-1">
					<h3 className="font-semibold text-[#071a78] text-lg">
						Orders status
					</h3>
					<p className="mt-1 text-slate-600 text-sm">
						Pending, completed, and cancelled orders across your events.
					</p>

					{isMetricsLoading ? (
						<div className="mt-4 flex h-72 items-center justify-center">
							<div className="h-48 w-48 animate-pulse rounded-full bg-slate-200" />
						</div>
					) : (
						<>
							<div className="mt-4 h-72">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Tooltip
											formatter={(value: unknown) => {
												const n =
													typeof value === "number" ? value : Number(value);
												return n.toLocaleString("en-IN");
											}}
										/>
										<Pie
											data={orderStatusPieData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											innerRadius={55}
											outerRadius={95}
											paddingAngle={3}
										>
											{orderStatusPieData.map((entry) => (
												<Cell key={entry.name} fill={entry.color} />
											))}
										</Pie>
									</PieChart>
								</ResponsiveContainer>
							</div>

							<div className="mt-4 space-y-2">
								{orderStatusPieData.map((d) => (
									<LegendRow
										key={d.name}
										label={d.name}
										value={d.value}
										color={d.color}
									/>
								))}
							</div>
						</>
					)}
				</div>

				<div className="space-y-6 lg:col-span-2">
					{isMetricsLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<StatusCardSkeleton />
							<StatusCardSkeleton />
							<StatusCardSkeleton />
							<StatusCardSkeleton />
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<StatusCard
								label="Draft"
								value={draftEventsTotal}
								color="#3b82f6"
							/>
							<StatusCard
								label="Published"
								value={publishedEventsTotal}
								color="#0a4bb8"
							/>
							<StatusCard
								label="Completed"
								value={completedEventsTotal}
								color="#8b5cf6"
							/>
							<StatusCard
								label="Cancelled"
								value={cancelledEventsTotal}
								color="#ef4444"
							/>
						</div>
					)}

					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
						<h3 className="font-semibold text-[#071a78] text-lg">
							Dashboard focus
						</h3>
						<p className="mt-1 text-slate-600 text-sm">
							Use the Events page to manage event records. This dashboard stays
							focused on analytics, orders, and operational health.
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
			bg: "bg-[#030370]/5",
			border: "border-[#030370]/15",
			text: "text-[#030370]",
			chip: "bg-[#030370] text-white",
		},
		green: {
			bg: "bg-[#10b981]/5",
			border: "border-[#10b981]/15",
			text: "text-[#059669]",
			chip: "bg-[#10b981] text-white",
		},
		amber: {
			bg: "bg-[#f59e0b]/5",
			border: "border-[#f59e0b]/15",
			text: "text-[#d97706]",
			chip: "bg-[#f59e0b] text-white",
		},
		violet: {
			bg: "bg-[#8b5cf6]/5",
			border: "border-[#8b5cf6]/15",
			text: "text-[#6d28d9]",
			chip: "bg-[#8b5cf6] text-white",
		},
	}[accent];

	return (
		<div
			className={`rounded-2xl border ${styles.border} bg-white ${styles.bg} p-6`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate font-medium text-slate-600 text-sm">{label}</p>
					<p className="mt-2 truncate font-bold text-3xl text-slate-900">
						{value}
					</p>
					<p className="mt-2 truncate text-slate-500 text-xs">{subLabel}</p>
				</div>
				<div
					className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.chip}`}
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
		<div className="flex items-center justify-between gap-3">
			<div className="flex min-w-0 items-center gap-2">
				<span
					aria-hidden="true"
					className="h-2.5 w-2.5 shrink-0 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<span className="truncate text-slate-700 text-sm">{label}</span>
			</div>
			<span className="font-semibold text-slate-900 text-sm">
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
		<div className="rounded-2xl border border-[#dbe7ff] bg-slate-50 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium text-slate-600 text-sm">{label}</p>
					<p className="mt-1 font-bold text-2xl text-slate-900">
						{value.toLocaleString("en-IN")}
					</p>
				</div>
				<div
					className="h-3.5 w-3.5 rounded-full"
					style={{ backgroundColor: color }}
				/>
			</div>
		</div>
	);
}
