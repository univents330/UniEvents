"use client";

import {
	Bell,
	CreditCard,
	Home,
	PlusCircle,
	Ticket,
	User,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { AppSidebar, type SidebarSection } from "@/core/components/app-sidebar";
import { DashboardNavbar } from "@/core/components/dashboard-navbar";
import { MobileGridMenu } from "@/core/components/mobile-grid-menu";
import { useAuth } from "@/core/providers/auth-provider";
import { NotificationDrawer } from "@/modules/marketing/components/notification-drawer";

export default function DashboardGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = useAuth();
	const _isHost = user?.isHost || user?.role === "ADMIN";
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] =
		useState(false);

	const unifiedSections: SidebarSection[] = [
		{
			title: "Main menu",
			items: [
				{ label: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
				{
					label: "Profile",
					href: "/dashboard/profile",
					icon: <User size={18} />,
				},
			],
		},
		{
			title: "Tickets & Events",
			items: [
				{
					label: "My Tickets",
					href: "/dashboard/tickets",
					icon: <Ticket size={18} />,
				},
			],
		},
		{
			title: "Transactions",
			items: [
				{
					label: "Orders",
					href: "/dashboard/orders",
					icon: <CreditCard size={18} />,
				},
				{
					label: "Payments",
					href: "/dashboard/payments",
					icon: <CreditCard size={18} />,
				},
			],
		},
		{
			title: "Event Management",
			items: [
				{
					label: "Create Event",
					href: "/dashboard/events/create",
					icon: <PlusCircle size={18} />,
				},
				{
					label: "Manage Events",
					href: "/dashboard/events",
					icon: <Zap size={18} />,
				},
			],
		},
		{
			title: "Operations",
			items: [
				{
					label: "Orders",
					href: "/dashboard/orders",
					icon: <CreditCard size={18} />,
				},
			],
		},
		{
			title: "Other",
			items: [
				{
					label: "Notifications",
					href: "/dashboard/notifications",
					icon: <Bell size={18} />,
				},
			],
		},
	];

	const sections = unifiedSections;

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<DashboardNavbar
				onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				onNotificationToggle={() => setIsNotificationDrawerOpen(true)}
				isMenuOpen={isMobileMenuOpen}
			/>
			<AppSidebar sections={sections} />
			<MobileGridMenu
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				sections={sections}
			/>
			<NotificationDrawer
				isOpen={isNotificationDrawerOpen}
				onClose={() => setIsNotificationDrawerOpen(false)}
			/>

			<main className="pt-16 lg:pl-64">
				<div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
			</main>
		</div>
	);
}
