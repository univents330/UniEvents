"use client";

import { LogOut } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useMemo } from "react";
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
	const activeHref = useMemo(() => {
		const matchedHrefs = sections
			.flatMap((section) => section.items)
			.map((item) => item.href)
			.filter((href) => pathname === href || pathname.startsWith(`${href}/`));

		if (matchedHrefs.length === 0) {
			return null;
		}

		return matchedHrefs.reduce((best, current) =>
			current.length > best.length ? current : best,
		);
	}, [pathname, sections]);

	const isActive = (href: string) => {
		return activeHref === href;
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		router.push("/login");
	};

	return (
		<aside className="fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-slate-200 border-r bg-white/90 backdrop-blur-md">
			<nav className="flex-1 overflow-y-auto px-4 py-5">
				<div className="space-y-6">
					{sections.map((section) => (
						<div key={section.title}>
							<p className="px-3 font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
								{section.title}
							</p>
							<ul className="mt-3 space-y-1">
								{section.items.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href as Route}
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
