"use client";

import { CreditCard, Home, LogOut, Settings, Ticket, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLogout } from "@/features/auth";
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

	const navSections: Array<{ title: string; items: NavItem[] }> = [
		{
			title: "Main menu",
			items: [
				{
					label: "Dashboard",
					href: "/user/dashboard",
					icon: <Home className="h-5 w-5" />,
				},
				{
					label: "Profile",
					href: "/user/profile",
					icon: <User className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Tickets & Events",
			items: [
				{
					label: "My Tickets",
					href: "/user/tickets",
					icon: <Ticket className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Transactions",
			items: [
				{
					label: "Orders",
					href: "/user/orders",
					icon: <CreditCard className="h-5 w-5" />,
				},
				{
					label: "Payments",
					href: "/user/payments",
					icon: <CreditCard className="h-5 w-5" />,
				},
			],
		},
		{
			title: "Account",
			items: [
				{
					label: "Settings",
					href: "/user/settings",
					icon: <Settings className="h-5 w-5" />,
				},
			],
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

	return (
		<aside className="fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-slate-200 border-r bg-white/90 backdrop-blur-md">
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
		</aside>
	);
}
