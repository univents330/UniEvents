"use client";

import {
	CheckCircle2,
	Globe,
	Loader2,
	MoreVertical,
	Settings,
	Ticket,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useAttendees } from "@/modules/attendees/hooks/use-attendees";
import { useOrders } from "@/modules/orders/hooks/use-orders";
import { Button } from "@/shared/ui/button";
import { useEvent, useEventTicketTiers } from "../hooks/use-events";

type EventManagementViewProps = {
	eventId: string;
};

export function EventManagementView({ eventId }: EventManagementViewProps) {
	const eventQuery = useEvent(eventId);
	const tiersQuery = useEventTicketTiers(eventId);
	const attendeesQuery = useAttendees({ eventId });
	const ordersQuery = useOrders({ eventId });

	const event = eventQuery.data;
	const tiers = tiersQuery.data?.data ?? [];
	const attendees = attendeesQuery.data?.data ?? [];
	const orders = ordersQuery.data?.data ?? [];

	const stats = useMemo(() => {
		if (!event) return null;

		const totalTickets = tiers.reduce((acc, t) => acc + t.quantity, 0);
		const soldTickets = tiers.reduce((acc, t) => acc + t.soldCount, 0);
		const totalRevenue =
			orders
				.filter((o) => o.status === "COMPLETED")
				.reduce((acc, o) => acc + (o.totalAmount || 0), 0) / 100;

		return {
			totalTickets,
			soldTickets,
			occupancy: totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0,
			totalRevenue,
			attendeeCount: attendees.length,
		};
	}, [event, tiers, orders, attendees]);

	if (eventQuery.isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-[#0a4bb8]" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
				<h2 className="font-bold text-2xl text-slate-900">Event not found</h2>
				<p className="mt-2 text-slate-600">
					The event you are looking for does not exist or you don't have access.
				</p>
				<Button asChild className="mt-6" variant="outline">
					<Link href="/dashboard/events">Back to Events</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{!event.isApproved && (
				<div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
							<Settings className="h-6 w-6 animate-pulse" />
						</div>
						<div>
							<h3 className="font-black text-amber-900 text-lg">
								Pending Admin Approval
							</h3>
							<p className="text-amber-800/70 text-sm">
								Your event is currently being reviewed. It will not be visible
								on the public discover page until approved.
							</p>
						</div>
					</div>
					<div className="hidden md:block">
						<span className="rounded-full bg-amber-200/50 px-4 py-1.5 font-black text-amber-900 text-xs uppercase tracking-widest">
							Admin Action Required
						</span>
					</div>
				</div>
			)}

			{/* Stats Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Tickets Sold"
					value={`${stats?.soldTickets} / ${stats?.totalTickets}`}
					subValue={`${stats?.occupancy.toFixed(1)}% capacity`}
					icon={<Ticket className="h-5 w-5 text-blue-600" />}
					color="blue"
				/>
				<StatCard
					label="Total Revenue"
					value={`₹${stats?.totalRevenue.toLocaleString("en-IN")}`}
					subValue="Gross sales"
					icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
					color="emerald"
				/>
				<StatCard
					label="Attendees"
					value={stats?.attendeeCount || 0}
					subValue="Registered users"
					icon={<Users className="h-5 w-5 text-purple-600" />}
					color="purple"
				/>
				<StatCard
					label="Visibility"
					value={event.visibility}
					subValue={event.mode}
					icon={<Globe className="h-5 w-5 text-amber-600" />}
					color="amber"
				/>
			</div>

			{/* Quick Actions & Sections */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{/* Ticket Tiers Summary */}
					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-bold text-lg text-slate-900">Ticket Tiers</h3>
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="text-[#0a4bb8]"
							>
								<Link href={`/dashboard/events/${event.id}/edit`}>Manage</Link>
							</Button>
						</div>
						<div className="space-y-3">
							{tiers.length === 0 ? (
								<p className="py-4 text-center text-slate-500 text-sm">
									No ticket tiers defined.
								</p>
							) : (
								tiers.map((tier) => (
									<div
										key={tier.id}
										className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4"
									>
										<div>
											<p className="font-bold text-slate-900">{tier.name}</p>
											<p className="text-slate-500 text-sm">
												₹{(tier.price / 100).toLocaleString("en-IN")} •{" "}
												{tier.quantity} total
											</p>
										</div>
										<div className="text-right">
											<p className="font-black text-slate-900">
												{tier.soldCount}
											</p>
											<p className="text-slate-500 text-xs uppercase tracking-wider">
												Sold
											</p>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Recent Activity / Attendees Placeholder */}
					<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-bold text-lg text-slate-900">
								Recent Attendees
							</h3>
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="text-[#0a4bb8]"
							>
								<Link href="/dashboard/attendees">View All</Link>
							</Button>
						</div>
						<div className="space-y-3">
							{attendees.length === 0 ? (
								<p className="py-4 text-center text-slate-500 text-sm">
									No attendees registered yet.
								</p>
							) : (
								attendees.slice(0, 5).map((attendee) => (
									<div
										key={attendee.id}
										className="flex items-center gap-3 rounded-xl border border-slate-50 p-3"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a4bb8]/10 font-bold text-[#0a4bb8]">
											{attendee.name.charAt(0)}
										</div>
										<div className="flex-1">
											<p className="font-semibold text-slate-900">
												{attendee.name}
											</p>
											<p className="text-slate-500 text-xs">{attendee.email}</p>
										</div>
										<div className="text-right text-slate-400 text-xs">
											{new Date(attendee.createdAt).toLocaleDateString()}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>

				<div className="space-y-6">
					{/* Event Preview Card */}
					<div className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white shadow-sm">
						<div className="aspect-video w-full bg-slate-100">
							{event.coverUrl ? (
								<Image
									src={event.coverUrl}
									alt={event.name}
									width={800}
									height={450}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-slate-400">
									No cover image
								</div>
							)}
						</div>
						<div className="p-4">
							<p className="font-bold text-slate-900">{event.name}</p>
							<p className="mt-1 line-clamp-2 text-slate-500 text-sm">
								{event.description}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	subValue,
	icon,
	color,
}: {
	label: string;
	value: string | number;
	subValue: string;
	icon: React.ReactNode;
	color: "blue" | "emerald" | "purple" | "amber";
}) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600 border-blue-100",
		emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
		purple: "bg-purple-50 text-purple-600 border-purple-100",
		amber: "bg-amber-50 text-amber-600 border-amber-100",
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm transition-all hover:shadow-md">
			<div className="flex items-center justify-between">
				<div className={`rounded-xl border p-2 ${colorClasses[color]}`}>
					{icon}
				</div>
				<button type="button" className="text-slate-300 hover:text-slate-600">
					<MoreVertical className="h-5 w-5" />
				</button>
			</div>
			<div className="mt-4">
				<p className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
					{label}
				</p>
				<p className="mt-1 font-black text-2xl text-slate-900 tracking-tight">
					{value}
				</p>
				<p className="mt-0.5 text-slate-400 text-sm">{subValue}</p>
			</div>
		</div>
	);
}
