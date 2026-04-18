import {
	BellRing,
	ClipboardList,
	Home,
	LogOut,
	PlusCircle,
	Settings,
	Users,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLogout } from "@/features/auth";
import { useMobileMenu } from "@/shared/context/mobile-menu-context";
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
	const mobileMenu = useMobileMenu();

	const navItems: NavItem[] = [
		{
			label: "Dashboard",
			href: "/host/dashboard",
			icon: <Home className="h-6 w-6" />,
		},
		{
			label: "Create Event",
			href: "/host/events/new",
			icon: <PlusCircle className="h-6 w-6" />,
		},
		{
			label: "Manage Events",
			href: "/host/events",
			icon: <Zap className="h-6 w-6" />,
		},
		{
			label: "My Requests",
			href: "/host/requests",
			icon: <BellRing className="h-6 w-6" />,
		},
		{
			label: "Orders",
			href: "/host/orders",
			icon: <ClipboardList className="h-6 w-6" />,
		},
		{
			label: "Attendees",
			href: "/host/attendees",
			icon: <Users className="h-6 w-6" />,
		},
		{
			label: "Check-ins",
			href: "/host/check-ins",
			icon: <Users className="h-6 w-6" />,
		},
		{
			label: "Analytics",
			href: "/host/analytics",
			icon: <Users className="h-6 w-6" />,
		},
		{
			label: "Settings",
			href: "/host/settings",
			icon: <Settings className="h-6 w-6" />,
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
		mobileMenu.close();
	};

	return (
		<>
			{/* Mobile Menu Overlay */}
			{mobileMenu.isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={mobileMenu.close}
					aria-label="Close menu"
				/>
			)}

			{/* Desktop Sidebar */}
			<aside className="hidden lg:fixed lg:top-16 lg:right-0 lg:left-0 lg:z-40 lg:flex lg:h-auto lg:flex-row lg:overflow-x-auto lg:border-slate-200 lg:border-b lg:bg-white/90 lg:backdrop-blur-md">
				<Navigation
					navItems={navItems}
					isActive={isActive}
					handleLogout={handleLogout}
					logoutMutation={logoutMutation}
				/>
			</aside>

			{/* Mobile Drawer */}
			<aside
				className={cn(
					"fixed top-14 right-0 left-0 z-40 flex max-h-[calc(100vh-3.5rem)] flex-col overflow-y-auto border-slate-200 border-b bg-white/90 backdrop-blur-md transition-transform duration-300 sm:top-16 sm:max-h-[calc(100vh-4rem)] lg:hidden",
					mobileMenu.isOpen ? "translate-y-0" : "-translate-y-full",
				)}
			>
				{/* Mobile Header with Close Button */}
				<div className="flex items-center justify-between border-slate-200 border-b px-4 py-4">
					<h2 className="font-bold text-[#030370] text-lg">Menu</h2>
					<button
						type="button"
						onClick={mobileMenu.close}
						className="rounded-lg p-1 text-slate-700 transition-colors hover:bg-slate-100"
						aria-label="Close menu"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<Navigation
					navItems={navItems}
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
	navItems: NavItem[];
	isActive: (href: string) => boolean;
	handleLogout: () => Promise<void>;
	logoutMutation: ReturnType<typeof useLogout>;
	onNavigate?: () => void;
}

function Navigation({
	navItems,
	isActive,
	handleLogout,
	logoutMutation,
	onNavigate,
}: NavigationProps) {
	return (
		<>
			{/* Navigation Grid - Horizontal on desktop */}
			<nav className="flex-1 overflow-x-auto lg:overflow-x-auto">
				<div className="grid grid-cols-3 gap-4 p-4 md:grid-cols-2 lg:flex lg:gap-0 lg:p-0">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href as never}
							onClick={onNavigate}
							className={cn(
								"flex flex-col items-center justify-center rounded-lg px-3 py-4 transition-all duration-200 hover:shadow-lg lg:flex-col lg:items-center lg:justify-center lg:rounded-none lg:border-b-2 lg:px-6 lg:py-3",
								isActive(item.href)
									? "bg-[#030370] text-white shadow-[0_14px_40px_rgba(3,3,112,0.25)] lg:border-[#030370] lg:bg-white/50"
									: "bg-slate-50 text-slate-700 hover:bg-slate-100 lg:border-transparent",
							)}
						>
							<span
								className={cn(
									"mb-2 transition-colors lg:mb-1",
									isActive(item.href)
										? "text-white lg:text-[#030370]"
										: "text-slate-500 group-hover:text-slate-700 lg:text-slate-500",
								)}
							>
								{item.icon}
							</span>
							<span className="text-center font-semibold text-xs">
								{item.label}
							</span>
							{item.badge && (
								<span className="mt-1 rounded-full bg-rose-500 px-2 py-1 text-white text-xs">
									{item.badge}
								</span>
							)}
						</Link>
					))}
				</div>
			</nav>

			{/* Logout Button */}
			<div className="border-slate-200 border-t px-4 py-4 lg:border-t-0 lg:border-l lg:px-4 lg:py-0">
				<button
					type="button"
					onClick={handleLogout}
					disabled={logoutMutation.isPending}
					className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 lg:h-full lg:gap-1 lg:rounded-none"
				>
					<LogOut className="h-4 w-4" />
					<span className="font-semibold text-xs lg:hidden">Logout</span>
				</button>
			</div>
		</>
	);
}
