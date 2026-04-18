"use client";

import {
	CreditCard,
	Heart,
	Home,
	LogOut,
	MapPin,
	Settings,
	Ticket,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useLogout } from "@/features/auth";
import { useMobileMenu } from "@/shared/context/mobile-menu-context";
import { cn } from "@/shared/lib/utils";

interface NavItem {
	label: string;
	href: string;
	icon: ReactNode;
	badge?: string;
}

export function UserSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const logoutMutation = useLogout();
	const mobileMenu = useMobileMenu();
	const asideRef = useRef<HTMLElement>(null);
	const touchStartX = useRef<number>(0);

	useEffect(() => {
		const handleTouchStart = (e: TouchEvent) => {
			touchStartX.current = e.touches[0]?.clientX || 0;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			const touchEndX = e.changedTouches[0]?.clientX || 0;
			const diff = touchStartX.current - touchEndX;

			// Swipe left (positive diff) or swipe right (negative diff)
			if (Math.abs(diff) > 50) {
				// Threshold of 50px for swipe detection
				mobileMenu.close();
			}
		};

		const drawer = asideRef.current;
		if (drawer) {
			drawer.addEventListener("touchstart", handleTouchStart);
			drawer.addEventListener("touchend", handleTouchEnd);

			return () => {
				drawer.removeEventListener("touchstart", handleTouchStart);
				drawer.removeEventListener("touchend", handleTouchEnd);
			};
		}
	}, [mobileMenu]);

	const navItems: NavItem[] = [
		{
			label: "Dashboard",
			href: "/user/dashboard",
			icon: <Home className="h-6 w-6" />,
		},
		{
			label: "Browse Events",
			href: "/events",
			icon: <MapPin className="h-6 w-6" />,
		},
		{
			label: "Liked",
			href: "/liked-events",
			icon: <Heart className="h-6 w-6" />,
		},
		{
			label: "Profile",
			href: "/user/profile",
			icon: <User className="h-6 w-6" />,
		},
		{
			label: "My Tickets",
			href: "/user/tickets",
			icon: <Ticket className="h-6 w-6" />,
		},
		{
			label: "Orders",
			href: "/user/orders",
			icon: <CreditCard className="h-6 w-6" />,
		},
		{
			label: "Payments",
			href: "/user/payments",
			icon: <CreditCard className="h-6 w-6" />,
		},
		{
			label: "Settings",
			href: "/user/settings",
			icon: <Settings className="h-6 w-6" />,
		},
	];

	const isActive = (href: string) => {
		if (href === "/user/dashboard") return pathname === href;
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
			{/* Mobile Menu Overlay — use div, not button, to avoid click-intercept issues */}
			{mobileMenu.isOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={mobileMenu.close}
					aria-hidden="true"
				/>
			)}

			{/* Mobile Drawer — slides in from top; fixed below navbar */}
			<aside
				ref={asideRef}
				className={cn(
					// Position fixed just below navbar; use translate-y for open/close
					"fixed right-0 left-0 z-40 flex flex-col overflow-y-auto border-slate-200 border-b bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden",
					// Positioned below navbar heights
					"top-14 sm:top-16",
					// Max height so it doesn't cover full screen
					"max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]",
					// Slide in/out vertically
					mobileMenu.isOpen ? "translate-y-0" : "-translate-y-[200%]",
				)}
				aria-hidden={!mobileMenu.isOpen}
			>
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
