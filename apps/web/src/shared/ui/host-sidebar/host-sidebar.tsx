import {
	BellRing,
	ClipboardList,
	Home,
	LogOut,
	Menu,
	Settings,
	Users,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { useLogout } from "@/features/auth";
import { cn } from "@/shared/lib/utils";

interface NavItem {
	label: string;
	href: string;
	icon: ReactNode;
	badge?: string;
}

export function HostSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const logoutMutation = useLogout();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navSections: Array<{ title: string; items: NavItem[] }> = [
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

	const isActive = (href: string) => {
		if (href === "/host/dashboard") return pathname === href;
		return pathname.startsWith(href);
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		router.push("/login");
	};

	const handleNavigate = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			{/* Mobile Menu Open Button - Only visible when menu is closed */}
			{!isMobileMenuOpen && (
				<button
					type="button"
					onClick={() => setIsMobileMenuOpen(true)}
					className="fixed top-14 left-4 z-50 rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 sm:top-16 lg:hidden"
					aria-label="Open menu"
				>
					<Menu className="h-6 w-6" />
				</button>
			)}

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
					aria-label="Close menu"
				/>
			)}

			{/* Desktop Sidebar */}
			<aside className="hidden lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-slate-200 lg:border-r lg:bg-white/90 lg:backdrop-blur-md">
				<Navigation
					navSections={navSections}
					isActive={isActive}
					handleLogout={handleLogout}
					logoutMutation={logoutMutation}
				/>
			</aside>

			{/* Mobile Drawer */}
			<aside
				className={cn(
					"fixed top-14 bottom-0 left-0 z-40 flex w-64 flex-col border-slate-200 border-r bg-white/90 backdrop-blur-md transition-transform duration-300 sm:top-16 lg:hidden",
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Mobile Header with Close Button */}
				<div className="flex items-center justify-between border-slate-200 border-b px-4 py-4">
					<h2 className="font-bold text-[#030370] text-lg">Menu</h2>
					<button
						type="button"
						onClick={() => setIsMobileMenuOpen(false)}
						className="rounded-lg p-1 text-slate-700 transition-colors hover:bg-slate-100"
						aria-label="Close menu"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<Navigation
					navSections={navSections}
					isActive={isActive}
					handleLogout={handleLogout}
					logoutMutation={logoutMutation}
					onNavigate={handleNavigate}
				/>
			</aside>
		</>
	);
}

interface NavigationProps {
	navSections: Array<{ title: string; items: NavItem[] }>;
	isActive: (href: string) => boolean;
	handleLogout: () => Promise<void>;
	logoutMutation: ReturnType<typeof useLogout>;
	onNavigate?: () => void;
}

function Navigation({
	navSections,
	isActive,
	handleLogout,
	logoutMutation,
	onNavigate,
}: NavigationProps) {
	return (
		<>
			{/* Navigation Items */}
			<nav className="flex-1 overflow-y-auto px-4 py-5">
				<div className="space-y-6">
					{navSections.map((section) => (
						<div key={section.title}>
							<p className="px-3 font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
								{section.title}
							</p>
							<ul className="mt-3 space-y-1">
								{section.items.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href as never}
											onClick={onNavigate}
											className={cn(
												"group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
												isActive(item.href)
													? "bg-[#030370] text-white shadow-[0_14px_40px_rgba(3,3,112,0.25)]"
													: "text-slate-700 hover:bg-slate-100",
											)}
										>
											<span
												className={cn(
													"shrink-0 transition-colors",
													isActive(item.href)
														? "text-white"
														: "text-slate-500 group-hover:text-slate-700",
												)}
											>
												{item.icon}
											</span>
											<span className="flex-1 font-semibold text-sm">
												{item.label}
											</span>
											{item.badge && (
												<span className="rounded-full bg-rose-500 px-2 py-1 text-white text-xs">
													{item.badge}
												</span>
											)}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</nav>

			{/* Logout Button */}
			<div className="border-slate-200 border-t px-4 py-4">
				<button
					type="button"
					onClick={handleLogout}
					disabled={logoutMutation.isPending}
					className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<LogOut className="h-5 w-5" />
					<span className="font-semibold text-sm">Logout</span>
				</button>
			</div>
		</>
	);
}
