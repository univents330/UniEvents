import {
	BellRing,
	ClipboardList,
	Home,
	PlusCircle,
	Settings,
	Users,
	Zap,
} from "lucide-react";
import { AppSidebar, type SidebarSection } from "@/shared/ui/app-sidebar";

export const navSections: SidebarSection[] = [
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
];

export function HostSidebar() {
	return <AppSidebar sections={navSections} />;
}
