"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";

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
	const { signOut } = useAuth();

	const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));

	const isActive = (href: string) => {
		if (pathname === href) return true;
		if (!pathname.startsWith(`${href}/`)) return false;

		// If it's a prefix match, ensure there isn't a more specific (longer) match available in the sidebar
		const hasBetterMatch = allHrefs.some(
			(h) => h !== href && pathname.startsWith(h) && h.length > href.length,
		);

		return !hasBetterMatch;
	};

	return (
		<aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-64 flex-col border-slate-200 border-r bg-white lg:flex">
			<nav className="flex-1 overflow-y-auto px-4 py-6">
				<div className="space-y-6">
					{sections.map((section) => (
						<div key={section.title}>
							<p className="mb-3 px-2 font-semibold text-slate-400 text-xs uppercase tracking-wider">
								{section.title}
							</p>
							<ul className="space-y-1">
								{section.items.map((item) => {
									const active = isActive(item.href);
									return (
										<li key={item.href}>
											<Link
												href={item.href}
												className={cn(
													"group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all",
													active
														? "bg-[#030370] text-white"
														: "text-slate-600 hover:bg-slate-50",
												)}
											>
												<span
													className={cn(
														"h-5 w-5 shrink-0",
														active
															? "text-white"
															: "text-slate-400 group-hover:text-slate-600",
													)}
												>
													{item.icon}
												</span>
												<span className="flex-1">{item.label}</span>
												{item.badge && (
													<span className="rounded-full bg-rose-500 px-2 py-0.5 text-white text-xs">
														{item.badge}
													</span>
												)}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>
			</nav>

			<div className="border-slate-200 border-t px-4 py-4">
				<button
					type="button"
					onClick={() => signOut?.()}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-slate-600 text-sm transition-all hover:bg-slate-50"
				>
					<LogOut className="h-5 w-5" />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
