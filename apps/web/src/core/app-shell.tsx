"use client";

import {
	Bell,
	CalendarCheck2,
	ClipboardList,
	Compass,
	CreditCard,
	Home,
	PlusCircle,
	Ticket,
	User,
	Users,
	Zap,
} from "lucide-react";
import { useAuth } from "@/core/providers/auth-provider";
import { AppNavbar, type MobileDrawerItem } from "./components/app-navbar";
import { AppSidebar, type SidebarSection } from "./components/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const isHost = user?.role === "HOST" || user?.role === "ADMIN";

	const userSections: SidebarSection[] = [
		{
			title: "Main menu",
			items: [
				{ label: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
				{ label: "Profile", href: "/profile", icon: <User size={18} /> },
			],
		},
		{
			title: "Tickets & Events",
			items: [
				{ label: "My Tickets", href: "/tickets", icon: <Ticket size={18} /> },
			],
		},
		{
			title: "Transactions",
			items: [
				{ label: "Orders", href: "/orders", icon: <CreditCard size={18} /> },
				{
					label: "Payments",
					href: "/payments",
					icon: <CreditCard size={18} />,
				},
			],
		},
	];

	const hostSections: SidebarSection[] = [
		{
			title: "Main menu",
			items: [
				{ label: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
				{
					label: "Create Event",
					href: "/events/create",
					icon: <PlusCircle size={18} />,
				},
				{ label: "Manage Events", href: "/events", icon: <Zap size={18} /> },
			],
		},
		{
			title: "Operations",
			items: [
				{
					label: "Orders",
					href: "/host/orders",
					icon: <ClipboardList size={18} />,
				},
				{
					label: "Attendees",
					href: "/host/attendees",
					icon: <Users size={18} />,
				},
				{
					label: "Check-ins",
					href: "/host/check-ins",
					icon: <Users size={18} />,
				},
			],
		},
	];

	const sections = isHost ? hostSections : userSections;
	const mobileDrawerItems: MobileDrawerItem[] = isHost
		? [
				{ label: "Home", href: "/dashboard", icon: Home },
				{ label: "Discover", href: "/discover", icon: Compass },
				{ label: "Events", href: "/events", icon: CalendarCheck2 },
				{ label: "Orders", href: "/host/orders", icon: ClipboardList },
				{ label: "Attendees", href: "/host/attendees", icon: Users },
				{ label: "Check-ins", href: "/host/check-ins", icon: Bell },
				{ label: "Profile", href: "/profile", icon: User },
				{ label: "Payments", href: "/payments", icon: CreditCard },
			]
		: [
				{ label: "Home", href: "/dashboard", icon: Home },
				{ label: "Discover", href: "/discover", icon: Compass },
				{ label: "Alerts", href: "/notifications", icon: Bell },
				{ label: "Profile", href: "/profile", icon: User },
				{ label: "My Tickets", href: "/tickets", icon: Ticket },
				{ label: "Orders", href: "/orders", icon: CreditCard },
				{ label: "Payments", href: "/payments", icon: CreditCard },
			];

	return (
		<div className="min-h-screen bg-[#f8fafc] font-jakarta">
			<AppNavbar mobileDrawerItems={mobileDrawerItems} />

			<div className="flex pt-16">
				<AppSidebar sections={sections} />

				<main className="min-h-[calc(100vh-64px)] flex-1 transition-all duration-500 lg:pl-64">
					<div className="mx-auto max-w-7xl p-6 lg:p-10">{children}</div>
				</main>
			</div>
		</div>
	);
}
