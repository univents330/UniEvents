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
					icon: <Home className="h-5 w-5" />,
				},
				{
					label: "Create Event",
					href: "/admin/events/new",
					icon: <PlusCircle className="h-5 w-5" />,
				},
				{
					label: "Manage Events",
					href: "/admin/events",
					icon: <Zap className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Approvals",
			items: [
				{
					label: "Event Approvals",
					href: "/admin/approvals",
					icon: <BellRing className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Operations",
			items: [
				{
					label: "Orders",
					href: "/admin/orders",
					icon: <ClipboardList className="h-5 w-5" />,
				},
				{
					label: "Attendees",
					href: "/admin/attendees",
					icon: <Users className="h-5 w-5" />,
				},
				{
					label: "Check-ins",
					href: "/admin/check-ins",
					icon: <Shield className="h-5 w-5" />,
				},
				{
					label: "Tickets",
					href: "/admin/tickets",
					icon: <Ticket className="h-5 w-5" />,
				},
				{
					label: "Passes",
					href: "/admin/passes",
					icon: <Ticket className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Admin",
			items: [
				{
					label: "Analytics",
					href: "/admin/analytics",
					icon: <Users className="h-5 w-5" />,
				},
				{
					label: "Users",
					href: "/admin/users",
					icon: <Users className="h-5 w-5" />,
				},
				{
					label: "Payments",
					href: "/admin/payments",
					icon: <ClipboardList className="h-5 w-5" />,
				},
				{
					label: "Settings",
					href: "/admin/settings",
					icon: <Settings className="h-5 w-5" />,
				},
			],
		},
	];

	return <AppSidebar sections={navSections} />;
}
