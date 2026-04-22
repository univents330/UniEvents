"use client";

import type { RevenueAnalytics } from "@unievent/schema";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export function RevenueChart({
	data,
}: {
	data: RevenueAnalytics["revenueByDate"];
}) {
	const chartData = useMemo(() => {
		return data.map((d) => ({
			date: new Intl.DateTimeFormat("en", {
				month: "short",
				day: "numeric",
			}).format(new Date(d.date)),
			revenue: d.revenue,
			orders: d.orders,
		}));
	}, [data]);

	if (chartData.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center rounded-xl border border-[#d7e0f8] bg-[#f8faff] text-[#5f6984] text-sm">
				No revenue data available for this range.
			</div>
		);
	}

	return (
		<div className="h-[300px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={chartData}
					margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
				>
					<defs>
						<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#1264db" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#1264db" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="#e2e8f0"
					/>
					<XAxis
						dataKey="date"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#64748b", fontSize: 12 }}
						dy={10}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#64748b", fontSize: 12 }}
						tickFormatter={(value) => `₹${value.toLocaleString()}`}
					/>
					<Tooltip
						contentStyle={{
							borderRadius: "12px",
							border: "1px solid #d7e0f8",
							boxShadow: "0 12px 28px rgba(19,41,102,0.08)",
							fontWeight: 600,
							color: "#0e1838",
						}}
						formatter={(value) => [
							`₹${Number(Array.isArray(value) ? value[0] : value).toLocaleString()}`,
							"Revenue",
						]}
					/>
					<Area
						type="monotone"
						dataKey="revenue"
						stroke="#1264db"
						strokeWidth={3}
						fillOpacity={1}
						fill="url(#colorRevenue)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

export function AttendanceChart({
	data,
}: {
	data: { date: string; attendees: number }[];
}) {
	const chartData = useMemo(() => {
		return data.map((d) => ({
			date: new Intl.DateTimeFormat("en", {
				month: "short",
				day: "numeric",
			}).format(new Date(d.date)),
			attendees: d.attendees,
		}));
	}, [data]);

	if (chartData.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center rounded-xl border border-[#d7e0f8] bg-[#f8faff] text-[#5f6984] text-sm">
				No attendance data available.
			</div>
		);
	}

	return (
		<div className="h-[300px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={chartData}
					margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="#e2e8f0"
					/>
					<XAxis
						dataKey="date"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#64748b", fontSize: 12 }}
						dy={10}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#64748b", fontSize: 12 }}
					/>
					<Tooltip
						cursor={{ fill: "#f1f5f9" }}
						contentStyle={{
							borderRadius: "12px",
							border: "1px solid #d7e0f8",
							boxShadow: "0 12px 28px rgba(19,41,102,0.08)",
							fontWeight: 600,
							color: "#0e1838",
						}}
						formatter={(value) => [value, "Attendees"]}
					/>
					<Bar
						dataKey="attendees"
						fill="#0d8a58"
						radius={[4, 4, 0, 0]}
						maxBarSize={60}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
