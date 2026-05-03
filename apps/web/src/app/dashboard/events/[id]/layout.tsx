"use client";

import {
	ChevronLeft,
	LayoutDashboard,
	Settings,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/core/lib/cn";
import { useEvent } from "@/modules/events/hooks/use-events";

export default function EventDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams();
	const pathname = usePathname();
	const eventId = params.id as string;
	const { data: event, isLoading } = useEvent(eventId);

	const navItems = [
		{
			label: "Overview",
			href: `/dashboard/events/${eventId}`,
			icon: <LayoutDashboard size={18} />,
			exact: true,
		},
		{
			label: "Attendees",
			href: `/dashboard/events/${eventId}/attendees`,
			icon: <Users size={18} />,
		},
		{
			label: "Check-ins",
			href: `/dashboard/events/${eventId}/check-ins`,
			icon: <Zap size={18} />,
		},
		{
			label: "Settings",
			href: `/dashboard/events/${eventId}/edit`,
			icon: <Settings size={18} />,
		},
	];

	const isActive = (item: (typeof navItems)[0]) => {
		if (item.exact) return pathname === item.href;
		return pathname.startsWith(item.href);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Event Context Header */}
			<div className="flex flex-col gap-4 border-slate-200 border-b pb-6 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard/events"
						className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all hover:bg-slate-50"
					>
						<ChevronLeft
							size={20}
							className="text-slate-400 transition-colors group-hover:text-slate-600"
						/>
					</Link>
					<div>
						{isLoading ? (
							<div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
						) : (
							<div className="flex items-center gap-3">
								<h1 className="font-black text-2xl text-slate-900 tracking-tight">
									{event?.name}
								</h1>
								<span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-bold text-slate-500 text-xs">
									{event?.status}
								</span>
							</div>
						)}
						<p className="text-slate-500 text-sm">Event Management Dashboard</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link
						href={`/events/${eventId}`}
						target="_blank"
						className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 text-sm hover:bg-slate-50"
					>
						View Public Page
					</Link>
				</div>
			</div>

			{/* Sub Navigation */}
			<div className="flex flex-wrap gap-2 border-slate-200 border-b pb-4">
				{navItems.map((item) => {
					const active = isActive(item);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all",
								active
									? "bg-[#030370] text-white shadow-[#030370]/20 shadow-lg"
									: "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
							)}
						>
							{item.icon}
							{item.label}
						</Link>
					);
				})}
			</div>

			{/* Content */}
			<div className="fade-in animate-in duration-500">{children}</div>
		</div>
	);
}
