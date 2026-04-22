"use client";

import { Database, LogOut, Zap } from "lucide-react";
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

	const isActive = (href: string) => {
		if (pathname === href) return true;
		return pathname.startsWith(`${href}/`);
	};

	return (
		<aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-64 flex-col border-[#dbe7ff] border-r bg-white transition-all duration-500 lg:flex">
			<nav className="scrollbar-none flex-1 overflow-y-auto px-4 py-8">
				<div className="space-y-10">
					{sections.map((section) => (
						<div key={section.title} className="space-y-4">
							<div className="flex items-center justify-between px-4">
								<p className="font-black text-[9px] text-slate-400 uppercase tracking-[0.3em]">
									{section.title}
								</p>
								<Database size={10} className="text-slate-200" />
							</div>
							<ul className="space-y-0.5">
								{section.items.map((item) => {
									const active = isActive(item.href);
									return (
										<li key={item.href}>
											<Link
												href={item.href}
												className={cn(
													"group relative flex items-center gap-4 border-l-2 px-4 py-3.5 transition-all duration-300",
													active
														? "border-[#030370] bg-[#030370]/5 text-[#030370]"
														: "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
												)}
											>
												<span
													className={cn(
														"shrink-0 transition-transform duration-300",
														active
															? "scale-110 text-[#030370]"
															: "text-slate-300 group-hover:text-slate-600",
													)}
												>
													{item.icon}
												</span>
												<span
													className={cn(
														"flex-1 font-black text-[11px] uppercase tracking-widest",
														active ? "" : "",
													)}
												>
													{item.label}
												</span>
												{item.badge ? (
													<span className="bg-rose-500 px-2 py-0.5 font-black text-[8px] text-white! uppercase tracking-widest">
														{item.badge}
													</span>
												) : (
													active && (
														<Zap
															size={10}
															className="animate-pulse text-[#030370]"
														/>
													)
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

			{/* Industrial Footer */}
			<div className="border-[#dbe7ff] border-t bg-slate-50 p-4">
				<button
					type="button"
					onClick={() => signOut?.()}
					className="group flex w-full items-center gap-4 px-4 py-4 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
				>
					<LogOut size={16} className="group-hover:text-red-600" />
					<span className="font-black text-[10px] uppercase tracking-[0.2em]">
						Logout
					</span>
				</button>
			</div>
		</aside>
	);
}
