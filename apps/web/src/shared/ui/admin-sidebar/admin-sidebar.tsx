import {
	BellRing,
	ClipboardList,
	Home,
	PlusCircle,
	Settings,
	Shield,
	Ticket,
	Users,
	Zap,
} from "lucide-react";
import { AppSidebar, type SidebarSection } from "@/shared/ui/app-sidebar";

export function AdminSidebar() {
	const navSections: SidebarSection[] = [
		{
			title: "Main menu",
			items: [
				{
					label: "Dashboard",
					href: "/admin/dashboard",
					icon: <Home className="h-6 w-6" />,
				},
				{
					label: "Create Event",
					href: "/admin/events/new",
					icon: <PlusCircle className="h-6 w-6" />,
				},
				{
					label: "Manage Events",
					href: "/admin/events",
					icon: <Zap className="h-6 w-6" />,
				},
			],
		},
		{
			title: "Approvals",
			items: [
				{
					label: "Event Approvals",
					href: "/admin/approvals",
					icon: <BellRing className="h-6 w-6" />,
				},
			],
		},
		{
			title: "Operations",
			items: [
				{
					label: "Orders",
					href: "/admin/orders",
					icon: <ClipboardList className="h-6 w-6" />,
				},
				{
					label: "Attendees",
					href: "/admin/attendees",
					icon: <Users className="h-6 w-6" />,
				},
				{
					label: "Check-ins",
					href: "/admin/check-ins",
					icon: <Shield className="h-6 w-6" />,
				},
				{
					label: "Tickets",
					href: "/admin/tickets",
					icon: <Ticket className="h-6 w-6" />,
				},
				{
					label: "Passes",
					href: "/admin/passes",
					icon: <Ticket className="h-6 w-6" />,
				},
			],
		},
		{
			title: "Admin",
			items: [
				{
					label: "Analytics",
					href: "/admin/analytics",
					icon: <Users className="h-6 w-6" />,
				},
				{
					label: "Users",
					href: "/admin/users",
					icon: <Users className="h-6 w-6" />,
				},
				{
					label: "Payments",
					href: "/admin/payments",
					icon: <ClipboardList className="h-6 w-6" />,
				},
				{
					label: "Settings",
					href: "/admin/settings",
					icon: <Settings className="h-6 w-6" />,
				},
			],
		},
	];

	return <AppSidebar sections={navSections} />;
}
