"use client";

import {
	CircleDollarSign,
	ClipboardList,
	Shield,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAttendees } from "@/features/attendees";
import { useEvents } from "@/features/events";
import { useOrders } from "@/features/orders";
import { usePayments } from "@/features/payments";
import { formatCurrency } from "@/shared/utils/format-currency";

export function AdminDashboardHome() {
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

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const allEvents = eventsQuery.data?.data ?? [];
	const draftEventsTotal = useMemo(
		() => allEvents.filter((event) => event.status === "DRAFT").length,
		[allEvents],
	);
	const publishedEventsTotal = useMemo(
		() => allEvents.filter((event) => event.status === "PUBLISHED").length,
		[allEvents],
	);
	const completedEventsTotal = useMemo(
		() => allEvents.filter((event) => event.status === "COMPLETED").length,
		[allEvents],
	);
	const cancelledEventsTotal = useMemo(
		() => allEvents.filter((event) => event.status === "CANCELLED").length,
		[allEvents],
	);

	const hostCount = useMemo(
		() => new Set(allEvents.map((event) => event.userId).filter(Boolean)).size,
		[allEvents],
	);

	const totalAttendees = attendeesQuery.data?.meta.total ?? 0;
	const pendingOrdersTotal = pendingOrdersQuery.data?.meta.total ?? 0;
	const completedOrdersTotal = completedOrdersQuery.data?.meta.total ?? 0;
	const cancelledOrdersTotal = cancelledOrdersQuery.data?.meta.total ?? 0;
	const totalOrders =
		pendingOrdersTotal + completedOrdersTotal + cancelledOrdersTotal;

	const paymentsQuery = usePayments({
		status: "SUCCESS",
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const [revenue, setRevenue] = useState<number>(0);

	useEffect(() => {
		const total = (paymentsQuery.data?.data ?? []).reduce(
			(acc, payment) => acc + (payment.amount ?? 0),
			0,
		);
		setRevenue(total);
	}, [paymentsQuery.data?.data]);

	const orderStatusPieData = useMemo(
		() => [
			{ name: "Pending", value: pendingOrdersTotal, color: "#f59e0b" },
			{ name: "Completed", value: completedOrdersTotal, color: "#10b981" },
			{ name: "Cancelled", value: cancelledOrdersTotal, color: "#ef4444" },
		],
		[pendingOrdersTotal, completedOrdersTotal, cancelledOrdersTotal],
	);

	return (
		<div className="space-y-8">
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-linear-to-br from-[#030370]/5 via-white to-[#245ed1]/5 p-6">
				<h2 className="font-bold text-[#071a78] text-xl">
					Super Admin Overview
				</h2>
				<p className="mt-1 text-slate-600">
					Global activity across all hosts, events, orders, and attendees.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
				<MetricCard
					label="Hosts"
					value={hostCount}
					icon={<Shield className="h-5 w-5" />}
					accent="indigo"
				/>
				<MetricCard
					label="Events"
					value={allEvents.length}
					icon={<Zap className="h-5 w-5" />}
					accent="blue"
				/>
				<MetricCard
					label="Attendees"
					value={totalAttendees}
					icon={<Users className="h-5 w-5" />}
					accent="green"
				/>
				<MetricCard
					label="Orders"
					value={totalOrders}
					icon={<ClipboardList className="h-5 w-5" />}
					accent="amber"
				/>
				<MetricCard
					label="Revenue"
					value={revenue}
					icon={<CircleDollarSign className="h-5 w-5" />}
					accent="violet"
					isCurrency
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 lg:col-span-1">
					<h3 className="font-semibold text-[#071a78] text-lg">Order status</h3>
					<div className="mt-4 h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip
									formatter={(value: unknown) =>
										Number(value).toLocaleString("en-IN")
									}
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
				</div>

				<div className="space-y-6 lg:col-span-2">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<StatusCard
							label="Draft Events"
							value={draftEventsTotal}
							color="#3b82f6"
						/>
						<StatusCard
							label="Published Events"
							value={publishedEventsTotal}
							color="#0a4bb8"
						/>
						<StatusCard
							label="Completed Events"
							value={completedEventsTotal}
							color="#8b5cf6"
						/>
						<StatusCard
							label="Cancelled Events"
							value={cancelledEventsTotal}
							color="#ef4444"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	label,
	value,
	icon,
	accent,
	isCurrency,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	accent: "indigo" | "blue" | "green" | "amber" | "violet";
	isCurrency?: boolean;
}) {
	const styles = {
		indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
		blue: "border-blue-200 bg-blue-50 text-blue-700",
		green: "border-green-200 bg-green-50 text-green-700",
		amber: "border-amber-200 bg-amber-50 text-amber-700",
		violet: "border-violet-200 bg-violet-50 text-violet-700",
	};

	return (
		<div className="rounded-xl border border-[#dbe7ff] bg-white p-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-slate-600 text-sm">{label}</p>
					<p className="mt-1 font-bold text-2xl text-slate-900">
						{isCurrency ? formatCurrency(value) : value.toLocaleString("en-IN")}
					</p>
				</div>
				<span
					className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${styles[accent]}`}
				>
					{icon}
				</span>
			</div>
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
		<div className="rounded-xl border border-[#dbe7ff] bg-white p-4">
			<p className="text-slate-600 text-sm">{label}</p>
			<div className="mt-2 flex items-end justify-between">
				<p className="font-bold text-2xl text-slate-900">
					{value.toLocaleString("en-IN")}
				</p>
				<span
					className="h-2.5 w-2.5 rounded-full"
					style={{ backgroundColor: color }}
				/>
			</div>
		</div>
	);
}
