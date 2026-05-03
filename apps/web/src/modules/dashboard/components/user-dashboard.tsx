"use client";

import { AlertCircle, CreditCard, Ticket, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/core/providers/auth-provider";
import { useOrders } from "@/modules/orders";
import { usePayments } from "@/modules/payments";
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
						href="/dashboard/tickets"
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
					value={totalSpent !== null ? Math.round(totalSpent / 100) : null}
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
							value={orderStatusPieData[0].value}
							color="#f59e0b"
						/>
						<StatusCard
							label="Completed Orders"
							value={orderStatusPieData[1].value}
							color="#10b981"
						/>
						<StatusCard
							label="Events Booked"
							value={totalEventsBooked}
							color="#8b5cf6"
						/>
						<StatusCard
							label="Cancelled Orders"
							value={orderStatusPieData[2].value}
							color="#ef4444"
						/>
					</div>

					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
						<h3 className="font-semibold text-[#071a78] text-lg">
							Quick actions
						</h3>
						<div className="mt-4 space-y-3">
							<Link
								href="/dashboard/tickets"
								className="block rounded-lg border border-slate-200 p-3 text-slate-700 transition-colors hover:bg-slate-50"
							>
								<p className="font-medium text-sm">Browse my tickets</p>
								<p className="mt-1 text-slate-600 text-xs">
									View and manage your tickets
								</p>
							</Link>
							<Link
								href="/dashboard/orders"
								className="block rounded-lg border border-slate-200 p-3 text-slate-700 transition-colors hover:bg-slate-50"
							>
								<p className="font-medium text-sm">View orders</p>
								<p className="mt-1 text-slate-600 text-xs">
									Check your purchase history
								</p>
							</Link>
							<Link
								href="/dashboard/payments"
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
