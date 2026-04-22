"use client";

import {
	BellRing,
	ClipboardList,
	Home,
	PlusCircle,
	Settings,
	Users,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import type { SidebarSection } from "@/shared/ui/app-sidebar";
import { HostSidebar } from "@/shared/ui/host-sidebar";

export default function HostLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const navSections = useMemo(
		(): SidebarSection[] => [
			{
				title: "Main menu",
				items: [
					{
						label: "Dashboard",
						href: "/host/dashboard",
						icon: <Home className="h-5 w-5" />,
					},
					{
						label: "Create Event",
						href: "/host/events/new",
						icon: <PlusCircle className="h-5 w-5" />,
					},
					{
						label: "Manage Events",
						href: "/host/events",
						icon: <Zap className="h-5 w-5" />,
					},
				],
			},
			{
				title: "Approvals",
				items: [
					{
						label: "My Requests",
						href: "/host/requests",
						icon: <BellRing className="h-5 w-5" />,
					},
				],
			},
			{
				title: "Leads",
				items: [
					{
						label: "Orders",
						href: "/host/orders",
						icon: <ClipboardList className="h-5 w-5" />,
					},
					{
						label: "Attendees",
						href: "/host/attendees",
						icon: <Users className="h-5 w-5" />,
					},
					{
						label: "Check-ins",
						href: "/host/check-ins",
						icon: <Users className="h-5 w-5" />,
					},
				],
			},
			{
				title: "Insights",
				items: [
					{
						label: "Analytics",
						href: "/host/analytics",
						icon: <Users className="h-5 w-5" />,
					},
				],
			},
			{
				title: "Comms",
				items: [
					{
						label: "Settings",
						href: "/host/settings",
						icon: <Settings className="h-5 w-5" />,
					},
				],
			},
		],
		[],
	);

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			{/* Desktop Sidebar - Hidden on Mobile */}
			<div className="hidden md:block">
				<HostSidebar />
			</div>

			{/* Main Content Area */}
			<main className="fixed top-16 right-0 bottom-0 left-0 overflow-y-auto overflow-x-hidden md:left-64">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-4 pt-2 pb-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
