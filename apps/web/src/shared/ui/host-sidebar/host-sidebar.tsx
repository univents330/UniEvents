import {
	BellRing,
	ClipboardList,
	Home,
	PlusCircle,
	Settings,
	Users,
	Zap,
} from "lucide-react";
import { AppSidebar, type SidebarSection } from "@/core/components/app-sidebar";

export const navSections: SidebarSection[] = [
	{
		title: "Main menu",
		items: [
			{
				label: "Dashboard",
				href: "/dashboard/events",
				icon: <Home className="h-5 w-5" />,
			},
			{
				label: "Create Event",
				href: "/dashboard/events/create",
				icon: <PlusCircle className="h-5 w-5" />,
			},
			{
				label: "Manage Events",
				href: "/dashboard/events",
				icon: <Zap className="h-5 w-5" />,
			},
		],
	},
	{
		title: "Approvals",
		items: [
			{
				label: "My Requests",
				href: "/dashboard/orders",
				icon: <BellRing className="h-5 w-5" />,
			},
		],
	},
	{
		title: "Leads",
		items: [
			{
				label: "Orders",
				href: "/dashboard/orders",
				icon: <ClipboardList className="h-5 w-5" />,
			},
			{
				label: "Attendees",
				href: "/dashboard/attendees",
				icon: <Users className="h-5 w-5" />,
			},
			{
				label: "Check-ins",
				href: "/dashboard/check-ins",
				icon: <Users className="h-5 w-5" />,
			},
		],
	},
	{
		title: "Insights",
		items: [
			{
				label: "Analytics",
				href: "/dashboard/events",
				icon: <Users className="h-5 w-5" />,
			},
		],
	},
	{
		title: "Comms",
		items: [
			{
				label: "Settings",
				href: "/dashboard/profile",
				icon: <Settings className="h-5 w-5" />,
			},
		],
	},
];

export function HostSidebar() {
	return <AppSidebar sections={navSections} />;
}
