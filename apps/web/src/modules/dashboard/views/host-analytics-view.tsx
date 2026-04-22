"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { AttendanceChart, RevenueChart } from "../components/analytics-charts";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

export function HostAnalyticsView() {
	const { user } = useAuth();
	const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

	const analyticsQuery = useDashboardAnalytics({
		groupBy,
		userId: user?.role === "HOST" ? user.id : undefined,
	});

	const revenue = analyticsQuery.revenueQuery.data;
	const attendees = analyticsQuery.attendeesQuery.data;

	const attendeesByDate = useMemo(() => {
		return (attendees?.attendeesByDate ?? []).map((point) => ({
			date: point.date,
			attendees: point.count,
		}));
	}, [attendees?.attendeesByDate]);

	if (analyticsQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading analytics...</div>
		);
	}

	if (
		analyticsQuery.revenueQuery.isError ||
		analyticsQuery.attendeesQuery.isError
	) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load analytics right now.
			</div>
		);
	}

	return (
		<div className="fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-700">
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<SectionTitle
					eyebrow="Host intelligence"
					title="Analytics overview"
					description="Track revenue momentum and attendee activity trends across your hosted events."
				/>

				<div className="flex items-center gap-3 rounded-2xl border border-[#dbe7ff] bg-white p-2 shadow-sm">
					<div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
						<span className="block font-black text-[10px] text-slate-400 uppercase tracking-widest">
							Group By
						</span>
						<Select
							value={groupBy}
							onChange={(e) =>
								setGroupBy(e.target.value as "day" | "week" | "month")
							}
							className="h-8 border-none bg-transparent p-0 font-bold text-slate-700 text-sm focus:ring-0"
						>
							<option value="day">Daily</option>
							<option value="week">Weekly</option>
							<option value="month">Monthly</option>
						</Select>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					label="Total Revenue"
					value={revenue?.totalRevenue ?? 0}
					prefix="INR "
				/>
				<MetricCard label="Total Orders" value={revenue?.totalOrders ?? 0} />
				<MetricCard
					label="Avg Order Value"
					value={Math.round(revenue?.averageOrderValue ?? 0)}
					prefix="INR "
				/>
				<MetricCard
					label="Check-In Rate"
					value={`${Math.round((attendees?.checkInRate ?? 0) * 100) / 100}%`}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm">
					<p className="font-black text-slate-500 text-sm uppercase tracking-widest">
						Revenue trend
					</p>
					<p className="mt-1 text-slate-600 text-sm">
						Revenue and order volume over time.
					</p>
					<div className="mt-4">
						<RevenueChart data={revenue?.revenueByDate ?? []} />
					</div>
				</div>

				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm">
					<p className="font-black text-slate-500 text-sm uppercase tracking-widest">
						Attendee trend
					</p>
					<p className="mt-1 text-slate-600 text-sm">
						Attendee growth and attendance activity.
					</p>
					<div className="mt-4">
						<AttendanceChart data={attendeesByDate} />
					</div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	label,
	value,
	prefix,
}: {
	label: string;
	value: number | string;
	prefix?: string;
}) {
	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm">
			<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
				{label}
			</p>
			<p className="mt-2 font-black text-2xl text-slate-900">
				{typeof value === "number"
					? `${prefix ?? ""}${value.toLocaleString("en-IN")}`
					: value}
			</p>
		</div>
	);
}
