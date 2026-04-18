"use client";

import { LogOut, Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useLogout } from "@/features/auth";
import { cn } from "@/shared/lib/utils";

export interface SidebarNavItem {
	label: string;
	href: string;
	icon: ReactNode;
	badge?: string;
}

export interface SidebarSection {
	title: string;
	items: SidebarNavItem[];
}

interface AppSidebarProps {
	sections: SidebarSection[];
}

export function AppSidebar({ sections }: AppSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const logoutMutation = useLogout();
	const [isOpen, setIsOpen] = useState(false);

	const isActive = (href: string) => {
		if (pathname === href) {
			return true;
		}

		return pathname.startsWith(`${href}/`);
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		router.push("/login");
	};

	const handleNavClick = () => {
		setIsOpen(false);
	};

	const allItems = sections.flatMap((section) => section.items);

	return (
		<>
			{/* Mobile Drawer Trigger Button */}
			<div className="fixed bottom-6 left-6 z-40 flex md:hidden">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#030370] bg-white shadow-lg transition-all hover:bg-slate-50"
					aria-label="Toggle navigation drawer"
				>
					{isOpen ? (
						<X className="h-6 w-6 text-[#030370]" />
					) : (
						<Menu className="h-6 w-6 text-[#030370]" />
					)}
				</button>
			</div>

			{/* Mobile Drawer Overlay */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
					onClick={() => setIsOpen(false)}
					aria-label="Close navigation drawer"
				/>
			)}

			{/* Mobile Drawer */}
			<aside
				className={cn(
					"fixed right-0 bottom-0 left-0 z-40 flex max-h-[80vh] flex-col overflow-y-auto rounded-t-3xl border-slate-200 border-t bg-white shadow-lg transition-all duration-300 md:hidden",
					isOpen
						? "translate-y-0 opacity-100"
						: "pointer-events-none translate-y-full opacity-0",
				)}
			>
				{/* Drawer Header */}
				<div className="sticky top-0 border-slate-200 border-b bg-white px-4 py-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-lg text-slate-900">Navigation</h2>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-full p-1 transition-colors hover:bg-slate-100"
						>
							<X className="h-5 w-5 text-slate-600" />
						</button>
					</div>
				</div>

				{/* Drawer Content */}
				<nav className="flex-1 overflow-y-auto px-2 py-4">
					<div className="space-y-1">
						{allItems.map((item) => (
							<Link
								key={item.href}
								href={item.href as Route}
								onClick={handleNavClick}
								className={cn(
									"flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
									isActive(item.href)
										? "bg-[#f4f6ff] font-semibold text-[#030370]"
										: "text-slate-700 hover:bg-slate-100",
								)}
							>
								<div
									className={cn(
										"flex h-6 w-6 items-center justify-center",
										isActive(item.href) ? "text-[#030370]" : "text-slate-500",
									)}
								>
									{item.icon}
								</div>
								<span className="flex-1">{item.label}</span>
								{item.badge && (
									<span className="rounded-full bg-rose-500 px-2 py-1 font-semibold text-white text-xs">
										{item.badge}
									</span>
								)}
							</Link>
						))}
					</div>
				</nav>

				{/* Drawer Footer */}
				<div className="border-slate-200 border-t bg-white px-2 py-4">
					<button
						type="button"
						onClick={() => {
							handleLogout();
							setIsOpen(false);
						}}
						disabled={logoutMutation.isPending}
						className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<LogOut className="h-5 w-5" />
						<span>
							{logoutMutation.isPending ? "Logging out..." : "Logout"}
						</span>
					</button>
				</div>
			</aside>
		</>
	);
}
