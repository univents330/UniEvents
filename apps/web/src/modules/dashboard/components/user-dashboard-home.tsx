"use client";

import { AlertCircle, CreditCard, Ticket, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAttendees } from "@/modules/attendees";
import { useMe } from "@/modules/auth";
import { useOrders } from "@/modules/orders";
import { paymentsService } from "@/modules/payments";
import { useTickets } from "@/modules/tickets";

interface MetricCardProps {
	icon: ReactNode;
	label: string;
	value: number | null;
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
		blue: "bg-blue-50 border-blue-200",
		green: "bg-green-50 border-green-200",
		amber: "bg-amber-50 border-amber-200",
		violet: "bg-violet-50 border-violet-200",
	};

	const iconColors = {
		blue: "text-blue-600",
		green: "text-green-600",
		amber: "text-amber-600",
		violet: "text-violet-600",
	};

	return (
		<div className={`rounded-xl border ${bgColors[accent]} p-5`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-slate-600 text-sm">{label}</p>
					<p className="mt-2 font-bold text-2xl">
						{isLoading ? (
							<span className="text-slate-400">-</span>
						) : value === null ? (
							<span className="text-slate-400">-</span>
						) : (
							value.toLocaleString("en-IN")
						)}
					</p>
					{subLabel && (
						<p className="mt-1 text-slate-500 text-xs">{subLabel}</p>
					)}
				</div>
				<div className={`${iconColors[accent]} rounded-lg bg-white p-2`}>
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
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div
					className="h-2.5 w-2.5 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<span className="text-slate-600 text-sm">{label}</span>
			</div>
			<span className="font-semibold text-slate-900 text-sm">
				{value.toLocaleString("en-IN")}
			</span>
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
		<div className="rounded-xl border border-[#dbe7ff] bg-white/80 p-4">
			<div className="flex items-center justify-between">
				<p className="text-slate-600 text-sm">{label}</p>
				<div
					className="flex h-10 w-10 items-center justify-center rounded-lg"
					style={{ backgroundColor: `${color}20` }}
				>
					<span className="font-bold text-lg" style={{ color }}>
						{value}
					</span>
				</div>
			</div>
		</div>
	);
}

export function UserDashboardHome() {
	const { data: user } = useMe();
	const userId = user?.id;

	const attendeesQuery = useAttendees(
		userId
			? {
					userId,
					page: 1,
					limit: 100,
					sortBy: "createdAt",
					sortOrder: "desc",
				}
			: undefined,
	);

	const userOrdersQuery = useOrders({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const userTicketsQuery = useTickets({
		page: 1,
		limit: 100,
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

	const attendeeIds = useMemo(
		() => attendeesQuery.data?.data.map((attendee) => attendee.id) ?? [],
		[attendeesQuery.data?.data],
	);

	// Filter for current user
	const userOrders = useMemo(() => {
		const allOrders = userOrdersQuery.data?.data ?? [];
		if (!userId || attendeeIds.length === 0) return [];
		return allOrders.filter((order) => attendeeIds.includes(order.attendeeId));
	}, [userOrdersQuery.data?.data, attendeeIds, userId]);

	const userOrderIds = useMemo(
		() => userOrders.map((order) => order.id),
		[userOrders],
	);

	const userTickets = useMemo(() => {
		const allTickets = userTicketsQuery.data?.data ?? [];
		if (!userId || userOrderIds.length === 0) return [];
		return allTickets.filter((ticket) => userOrderIds.includes(ticket.orderId));
	}, [userTicketsQuery.data?.data, userOrderIds, userId]);

	const totalTickets = userTickets.length;
	const totalEventsBooked = useMemo(
		() => new Set(userTickets.map((ticket) => ticket.eventId)).size,
		[userTickets],
	);

	const totalOrders = userOrders.length;
	const pendingOrdersTotal = pendingOrdersQuery.data?.meta.total ?? 0;
	const completedOrdersTotal = completedOrdersQuery.data?.meta.total ?? 0;
	const cancelledOrdersTotal = cancelledOrdersQuery.data?.meta.total ?? 0;

	const [totalSpent, setTotalSpent] = useState<number | null>(null);

	useEffect(() => {
		if (!userId) return;

		let cancelled = false;

		(async () => {
			try {
				let page = 1;
				let sum = 0;

				// Sum up all completed orders for the user
				while (page <= 10) {
					const res = await paymentsService.list({
						status: "SUCCESS",
						page,
						limit: 100,
						sortBy: "createdAt",
						sortOrder: "desc",
					});

					sum += res.data.reduce(
						(acc: number, p: { amount?: number | null }) =>
							acc + (p.amount ?? 0),
						0,
					);

					if (!res.meta.hasNextPage) break;
					page += 1;
				}

				if (!cancelled) setTotalSpent(sum);
			} catch {
				if (!cancelled) setTotalSpent(0);
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
		userOrdersQuery.isLoading ||
		userTicketsQuery.isLoading ||
		pendingOrdersQuery.isLoading ||
		completedOrdersQuery.isLoading ||
		cancelledOrdersQuery.isLoading ||
		totalSpent === null;

	return (
		<div className="space-y-8">
			{/* Welcome Card */}
			<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-linear-to-br from-[#030370]/5 via-white to-[#245ed1]/5 p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="min-w-0">
						<h2 className="font-bold text-[#071a78] text-xl">
							Welcome back, {user?.email?.split("@")[0]}!
						</h2>
						<p className="mt-1 text-slate-600">
							Manage your tickets, orders, and payments all in one place.
						</p>
					</div>
					<Link
						href={"/dashboard/tickets" as Route}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#030370] px-5 py-3 font-semibold text-white shadow-[0_14px_40px_rgba(3,3,112,0.25)] transition-colors hover:bg-[#030370]/90"
					>
						<Ticket className="h-5 w-5" />
						View tickets
					</Link>
				</div>

				{totalTickets === 0 && (
					<div className="mt-4 rounded-xl border border-[#dbe7ff] bg-white/70 p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
							<p className="text-slate-700 text-sm">
								You don't have any tickets yet. Browse events and purchase
								tickets to get started.
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Key metrics */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					icon={<Ticket className="h-5 w-5" />}
					label="My Tickets"
					value={totalTickets}
					subLabel="Total tickets purchased"
					accent="blue"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<CreditCard className="h-5 w-5" />}
					label="Total Orders"
					value={totalOrders}
					subLabel="All orders placed"
					accent="green"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<Users className="h-5 w-5" />}
					label="Events Booked"
					value={totalEventsBooked}
					subLabel="Distinct events with tickets"
					accent="amber"
					isLoading={isMetricsLoading}
				/>
				<MetricCard
					icon={<CreditCard className="h-5 w-5" />}
					label="Total Spent"
					value={
						totalSpent !== null
							? Math.round(totalSpent / 100) // Convert paisa to rupees
							: null
					}
					subLabel="Successful payments"
					accent="violet"
					isLoading={totalSpent === null}
				/>
			</div>

			{/* Charts + overview */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 lg:col-span-1">
					<h3 className="font-semibold text-[#071a78] text-lg">Order status</h3>
					<p className="mt-1 text-slate-600 text-sm">
						Pending, completed, and cancelled orders.
					</p>

					<div className="mt-4 h-72">
						<ResponsiveContainer width="100%" height="100%">
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

				<div className="space-y-6 lg:col-span-2">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<StatusCard
							label="Pending Orders"
							value={pendingOrdersTotal}
							color="#f59e0b"
						/>
						<StatusCard
							label="Completed Orders"
							value={completedOrdersTotal}
							color="#10b981"
						/>
						<StatusCard
							label="Events Booked"
							value={totalEventsBooked}
							color="#8b5cf6"
						/>
						<StatusCard
							label="Cancelled Orders"
							value={cancelledOrdersTotal}
							color="#ef4444"
						/>
					</div>

					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
						<h3 className="font-semibold text-[#071a78] text-lg">
							Quick actions
						</h3>
						<div className="mt-4 space-y-3">
							<Link
								href={"/dashboard/tickets" as Route}
								className="block rounded-lg border border-slate-200 p-3 text-slate-700 transition-colors hover:bg-slate-50"
							>
								<p className="font-medium text-sm">Browse my tickets</p>
								<p className="mt-1 text-slate-600 text-xs">
									View and manage your tickets
								</p>
							</Link>
							<Link
								href={"/dashboard/orders" as Route}
								className="block rounded-lg border border-slate-200 p-3 text-slate-700 transition-colors hover:bg-slate-50"
							>
								<p className="font-medium text-sm">View orders</p>
								<p className="mt-1 text-slate-600 text-xs">
									Check your purchase history
								</p>
							</Link>
							<Link
								href={"/dashboard/payments" as Route}
								className="block rounded-lg border border-slate-200 p-3 text-slate-700 transition-colors hover:bg-slate-50"
							>
								<p className="font-medium text-sm">Payment history</p>
								<p className="mt-1 text-slate-600 text-xs">
									View all your transactions
								</p>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
