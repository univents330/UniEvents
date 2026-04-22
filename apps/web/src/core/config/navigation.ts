export const navigation = [
	{ href: "/", label: "Home", roles: ["USER", "HOST", "ADMIN"] },
	{ href: "/events", label: "Events", roles: ["USER", "HOST", "ADMIN"] },
	{ href: "/tickets", label: "Tickets", roles: ["USER", "HOST", "ADMIN"] },
	{ href: "/dashboard", label: "Dashboard", roles: ["HOST", "ADMIN"] },
] as const;

export const managementNavigation = [
	{ href: "/attendees", label: "Attendees", roles: ["HOST", "ADMIN"] },
	{ href: "/orders", label: "Orders", roles: ["USER", "HOST", "ADMIN"] },
	{ href: "/passes", label: "Passes", roles: ["USER", "HOST", "ADMIN"] },
	{ href: "/check-ins", label: "Check-ins", roles: ["HOST", "ADMIN"] },
	{ href: "/check-ins/scan", label: "Scan QR", roles: ["HOST", "ADMIN"] },
	{ href: "/payments", label: "Payments", roles: ["HOST", "ADMIN"] },
	{
		href: "/notifications",
		label: "Notifications",
		roles: ["USER", "HOST", "ADMIN"],
	},
] as const;

export const modulePillars = [
	"Discover Events",
	"Book Passes",
	"Mobile Tickets",
	"Entry Ready",
] as const;
