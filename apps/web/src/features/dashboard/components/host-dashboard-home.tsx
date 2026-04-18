"use client";

import {
	CircleDollarSign,
	ClipboardList,
	Plus,
	Users,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAttendees } from "@/features/attendees";
import { useCurrentUser } from "@/features/auth";
import { useEvents } from "@/features/events";
import { useOrders } from "@/features/orders";
import { paymentsService } from "@/features/payments";
import { formatCurrency } from "@/shared/utils/format-currency";

export function HostDashboardHome() {
	const { data: user } = useCurrentUser();
	const userId = user?.id;

	const attendeesQuery = useAttendees({
		page: 1,
		limit: 1,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const pendingOrdersQuery = useOrders({
		status: "PENDING",
		page: 1,
		limit: 1,
		sortBy: "createdAt",
		sortOrder: "desc",
	});
	const completedOrdersQuery = useOrders({
		status: "COMPLETED",
		page: 1,
		limit: 1,
		sortBy: "createdAt",
		sortOrder: "desc",
	});
	const cancelledOrdersQuery = useOrders({
		status: "CANCELLED",
		page: 1,
		limit: 1,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const hostEventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const hostEvents = useMemo(() => {
		const allEvents = hostEventsQuery.data?.data ?? [];
		if (!userId) return [];
		return allEvents.filter((event) => event.userId === userId);
	}, [hostEventsQuery.data?.data, userId]);

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

	const totalAttendees = attendeesQuery.data?.meta.total ?? 0;

	const pendingOrdersTotal = pendingOrdersQuery.data?.meta.total ?? 0;
	const completedOrdersTotal = completedOrdersQuery.data?.meta.total ?? 0;
	const cancelledOrdersTotal = cancelledOrdersQuery.data?.meta.total ?? 0;

	const activeOrdersTotal = pendingOrdersTotal + completedOrdersTotal;

	const conversionRate =
		pendingOrdersTotal + completedOrdersTotal > 0
			? (completedOrdersTotal / (pendingOrdersTotal + completedOrdersTotal)) *
				100
			: 0;

	const [revenue, setRevenue] = useState<number | null>(null);
	useEffect(() => {
		if (!userId) return;

		let cancelled = false;

		(async () => {
			try {
				let page = 1;
				let sum = 0;

				// Payments are paginated (max 100 per request). We loop until the backend says no more.
				// Safety cap: avoid infinite loops in case meta.hasNextPage behaves unexpectedly.
				while (page <= 10) {
					const res = await paymentsService.getPayments({
						status: "SUCCESS",
						page,
						limit: 100,
						sortBy: "createdAt",
						sortOrder: "desc",
					});

					sum += res.data.reduce((acc, p) => acc + (p.amount ?? 0), 0);

					if (!res.meta.hasNextPage) break;
					page += 1;
				}

				if (!cancelled) setRevenue(sum);
			} catch {
				if (!cancelled) setRevenue(0);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [userId]);

	const orderStatusPieData = useMemo(() => {
		return [
			{ name: "Pending", value: pendingOrdersTotal, color: "#f59e0b" },
			{ name: "Completed", value: completedOrdersTotal, color: "#10b981" },
			{ name: "Cancelled", value: cancelledOrdersTotal, color: "#ef4444" },
		];
	}, [pendingOrdersTotal, completedOrdersTotal, cancelledOrdersTotal]);

	const isMetricsLoading =
		attendeesQuery.isLoading ||
		pendingOrdersQuery.isLoading ||
		completedOrdersQuery.isLoading ||
		cancelledOrdersQuery.isLoading ||
		hostEventsQuery.isLoading ||
		revenue === null;

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Create Event (home first) */}
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-linear-to-br from-[#030370]/5 via-white to-[#245ed1]/5 p-4 sm:p-5 md:p-6 lg:p-8">
				<div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
					<div className="min-w-0">
						<h2 className="font-bold text-[#071a78] text-lg sm:text-xl md:text-2xl">
							Create your next event
						</h2>
						<p className="mt-1 text-slate-600">
							Create and manage your events from one place.
						</p>
					</div>
					<Link
						href={"/host/events/new" as Route}
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#030370] px-4 py-2.5 font-semibold text-sm text-white shadow-[0_14px_40px_rgba(3,3,112,0.25)] transition-colors hover:bg-[#030370]/90 sm:rounded-xl sm:px-5 sm:py-3 sm:text-base"
					>
						<Plus className="h-4 w-4 sm:h-5 sm:w-5" />
						Create event
					</Link>
				</div>
			</div>

			{/* Key metrics */}
			<div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6">
				<MetricCard
					icon={<Zap className="h-5 w-5" />}
					label="Total Events"
					value={allEventsTotal}
					subLabel="Draft + Published + Completed"
					accent="blue"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<Users className="h-5 w-5" />}
					label="Total Attendees"
					value={totalAttendees}
					subLabel="Across your host events"
					accent="green"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<ClipboardList className="h-5 w-5" />}
					label="Active Orders"
					value={activeOrdersTotal}
					subLabel={`Conversion: ${conversionRate.toFixed(1)}%`}
					accent="amber"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<CircleDollarSign className="h-5 w-5" />}
					label="Total Revenue"
					value={revenue}
					subLabel="Successful payments only"
					accent="violet"
					isLoading={revenue === null}
				/>
			</div>

			{/* Charts + event overview */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-4 sm:p-5 md:p-6 lg:col-span-1">
					<h3 className="font-semibold text-[#071a78] text-base sm:text-lg">
						Orders status
					</h3>
					<p className="mt-1 text-slate-600 text-xs sm:text-sm">
						Pending, completed, and cancelled orders across your events.
					</p>

					<div className="mt-4 h-64 w-full sm:h-72">
						<ResponsiveContainer width="100%" height="100%" minWidth={0}>
							<PieChart>
								<Tooltip
									formatter={(value: unknown) => {
										const n = typeof value === "number" ? value : Number(value);
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
				</div>

				<div className="space-y-4 sm:space-y-5 md:space-y-6 lg:col-span-2">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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

					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-4 sm:p-5 md:p-6">
						<h3 className="font-semibold text-[#071a78] text-base sm:text-lg">
							Dashboard focus
						</h3>
						<p className="mt-1 text-slate-600 text-xs sm:text-sm">
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
	isLoading,
}: {
	icon: ReactNode;
	label: string;
	value: number | null;
	subLabel: string;
	accent: "blue" | "green" | "amber" | "violet";
	isLoading?: boolean;
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

	const displayValue = isLoading
		? "--"
		: accent === "violet"
			? formatCurrency(typeof value === "number" ? value : null)
			: (value ?? 0).toLocaleString("en-IN");

	return (
		<div
			className={`rounded-2xl border ${styles.border} bg-white ${styles.bg} p-4 sm:p-5 md:p-6 lg:p-8`}
		>
			<div className="flex items-start justify-between gap-2 sm:gap-3">
				<div className="min-w-0">
					<p className="truncate font-medium text-slate-600 text-xs sm:text-sm">
						{label}
					</p>
					<p className="mt-1 truncate font-bold text-2xl text-slate-900 sm:mt-2 sm:text-3xl md:text-4xl">
						{displayValue}
					</p>
					<p className="mt-1 truncate text-slate-500 text-xs sm:mt-2">
						{subLabel}
					</p>
				</div>
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 md:h-12 md:w-12 ${styles.chip} shrink-0`}
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
		<div className="flex items-center justify-between gap-2 sm:gap-3">
			<div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
				<span
					aria-hidden="true"
					className="h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5"
					style={{ backgroundColor: color }}
				/>
				<span className="truncate text-slate-700 text-xs sm:text-sm">
					{label}
				</span>
			</div>
			<span className="font-semibold text-slate-900 text-xs sm:text-sm">
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
		<div className="rounded-lg border border-[#dbe7ff] bg-slate-50 p-3 sm:rounded-xl sm:p-4 md:p-5">
			<div className="flex items-center justify-between gap-2 sm:gap-3">
				<div className="min-w-0">
					<p className="font-medium text-slate-600 text-xs sm:text-sm">
						{label}
					</p>
					<p className="mt-1 font-bold text-lg text-slate-900 sm:text-xl md:text-2xl">
						{value.toLocaleString("en-IN")}
					</p>
				</div>
				<div
					className="h-3 w-3 shrink-0 rounded-full sm:h-3.5 sm:w-3.5"
					style={{ backgroundColor: color }}
				/>
			</div>
		</div>
	);
}
