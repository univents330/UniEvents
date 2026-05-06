"use client";

import {
	CircleDollarSign,
	CreditCard,
	Plus,
	Ticket,
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
import { useTickets } from "@/modules/tickets";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

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
							<span className="animate-pulse text-slate-300">---</span>
						) : (
							(value ?? 0)
						)}
					</p>
					{subLabel && (
						<p className="mt-1 text-slate-500 text-xs">{subLabel}</p>
					)}
				</div>
				<div className={iconColors[accent]}>{icon}</div>
			</div>
		</div>
	);
}

export function UnifiedDashboard() {
	const { user } = useAuth();
	const userId = user?.id;
	const isHost = user?.isHost;

	// User-specific data
	const userOrdersQuery = useOrders({ limit: 100 });
	const userTicketsQuery = useTickets({ limit: 100 });
	const userPaymentsQuery = usePayments({ limit: 100, status: "SUCCESS" });

	// Host-specific data
	const hostEventsQuery = useEvents({ userId, limit: 100 });
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

	// Metrics
	const totalRevenue = useMemo(
		() => payments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
		[payments],
	);

	const totalTickets = userTicketsQuery.data?.data?.length ?? 0;
	const totalOrders = userOrdersQuery.data?.data?.length ?? 0;

	const draftEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "DRAFT").length,
		[hostEvents],
	);
	const publishedEventsTotal = useMemo(
		() => hostEvents.filter((event) => event.status === "PUBLISHED").length,
		[hostEvents],
	);

	// Chart data
	const chartData = useMemo(() => {
		if (isHost) {
			return [
				{ name: "Published", value: publishedEventsTotal, color: "#22c55e" },
				{ name: "Draft", value: draftEventsTotal, color: "#f59e0b" },
			];
		}
		const completedOrders = totalOrders;
		const pendingOrders = 0;
		return [
			{ name: "Completed", value: completedOrders, color: "#22c55e" },
			{ name: "Pending", value: pendingOrders, color: "#f59e0b" },
		];
	}, [isHost, publishedEventsTotal, draftEventsTotal, totalOrders]);

	return (
		<div className="space-y-8">
			{/* Welcome Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-slate-900">
						Welcome back, {user?.name || "User"}!
					</h1>
					<p className="mt-1 text-slate-600">
						{isHost
							? "Manage your events and track your performance"
							: "View your tickets and bookings"}
					</p>
				</div>
				{isHost && (
					<Link
						href="/dashboard/events/create"
						className="inline-flex items-center gap-2 rounded-xl bg-[#030370] px-5 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-[#030370]/90"
					>
						<Plus className="h-5 w-5" />
						Create Event
					</Link>
				)}
			</div>

			{/* Metrics Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{isHost ? (
					<>
						<MetricCard
							icon={<Zap className="h-6 w-6" />}
							label="Total Events"
							value={hostEvents.length}
							subLabel={`${publishedEventsTotal} published`}
							accent="blue"
							isLoading={hostEventsQuery.isLoading}
						/>
						<MetricCard
							icon={<Users className="h-6 w-6" />}
							label="Total Attendees"
							value={attendeesCount}
							accent="green"
							isLoading={analyticsQuery.attendeesQuery.isLoading}
						/>
						<MetricCard
							icon={<CircleDollarSign className="h-6 w-6" />}
							label="Total Revenue"
							value={totalRevenue / 100}
							subLabel="₹"
							accent="amber"
							isLoading={userPaymentsQuery.isLoading}
						/>
						<MetricCard
							icon={<Ticket className="h-6 w-6" />}
							label="Total Orders"
							value={orders.length}
							accent="violet"
							isLoading={userOrdersQuery.isLoading}
						/>
					</>
				) : (
					<>
						<MetricCard
							icon={<Ticket className="h-6 w-6" />}
							label="My Tickets"
							value={totalTickets}
							accent="blue"
							isLoading={userTicketsQuery.isLoading}
						/>
						<MetricCard
							icon={<CreditCard className="h-6 w-6" />}
							label="Total Orders"
							value={totalOrders}
							accent="green"
							isLoading={userOrdersQuery.isLoading}
						/>
						<MetricCard
							icon={<CircleDollarSign className="h-6 w-6" />}
							label="Total Spent"
							value={
								(userPaymentsQuery.data?.data ?? []).reduce(
									(sum, p) => sum + (p.amount ?? 0),
									0,
								) / 100
							}
							subLabel="₹"
							accent="amber"
							isLoading={userPaymentsQuery.isLoading}
						/>
						<MetricCard
							icon={<Users className="h-6 w-6" />}
							label="Events Attended"
							value={totalTickets}
							accent="violet"
							isLoading={userTicketsQuery.isLoading}
						/>
					</>
				)}
			</div>

			{/* Quick Actions */}
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-semibold text-lg text-slate-900">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
					{isHost ? (
						<>
							<Link
								href="/dashboard/events"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<Zap className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">
									Manage Events
								</span>
							</Link>
							<Link
								href="/dashboard/orders"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<Ticket className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">View Orders</span>
							</Link>
						</>
					) : (
						<>
							<Link
								href="/dashboard/tickets"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<Ticket className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">My Tickets</span>
							</Link>
							<Link
								href="/dashboard/orders"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<CreditCard className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">My Orders</span>
							</Link>
							<Link
								href="/dashboard/passes"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<Ticket className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">My Passes</span>
							</Link>
							<Link
								href="/dashboard/profile"
								className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
							>
								<Users className="h-5 w-5 text-[#030370]" />
								<span className="font-medium text-slate-900">Profile</span>
							</Link>
						</>
					)}
				</div>
			</div>

			{/* Chart Section */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 font-semibold text-lg text-slate-900">
						{isHost ? "Event Status" : "Order Status"}
					</h2>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="value"
								>
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 font-semibold text-lg text-slate-900">
						{isHost ? "Recent Events" : "Recent Activity"}
					</h2>
					<div className="space-y-3">
						{isHost
							? hostEvents.slice(0, 5).map((event) => (
									<Link
										key={event.id}
										href={`/dashboard/events/${event.id}/edit`}
										className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-[#030370] hover:bg-[#030370]/5"
									>
										<p className="font-medium text-slate-900 text-sm">
											{event.name}
										</p>
										<p className="mt-1 text-slate-500 text-xs">
											{event.status} • {formatDate(event.startDate)}
										</p>
									</Link>
								))
							: userOrdersQuery.data?.data?.slice(0, 5).map((order) => (
									<div
										key={order.id}
										className="rounded-lg border border-slate-200 p-3"
									>
										<p className="font-medium text-slate-900 text-sm">
											Order #{order.id.slice(0, 8)}
										</p>
										<p className="mt-1 text-slate-500 text-xs">
											{order.status} • ₹{(order.totalAmount / 100).toFixed(0)}
										</p>
									</div>
								))}
						{((isHost && hostEvents.length === 0) ||
							(!isHost && totalOrders === 0)) && (
							<p className="py-8 text-center text-slate-500 text-sm">
								No {isHost ? "events" : "activity"} yet
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
