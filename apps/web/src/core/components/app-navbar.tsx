"use client";

import {
	Bell,
	Heart,
	LayoutGrid,
	LogOut,
	type LucideIcon,
	Plus,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import { useUnreadCount } from "@/modules/notifications";

export interface MobileDrawerItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

interface AppNavbarProps {
	mobileDrawerItems: MobileDrawerItem[];
}

export function AppNavbar({ mobileDrawerItems }: AppNavbarProps) {
	const { user, isAuthenticated, signOut } = useAuth();
	const pathname = usePathname();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const unreadQuery = useUnreadCount({ enabled: isAuthenticated });
	const unreadCount = unreadQuery.data?.count ?? 0;
	const isHost = user?.role === "HOST" || user?.role === "ADMIN";

	useEffect(() => {
		setIsDrawerOpen(false);
	}, []);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-slate-100 border-b bg-white px-4 sm:px-8">
			{/* Left: Branding */}
			<div className="flex items-center gap-6">
				<Link href="/" className="group flex items-center gap-3">
					<div className="relative h-7 w-7 transition-transform duration-500 group-hover:scale-110">
						<Image
							src="/assets/logo_circle_svg.svg"
							alt="UniEvent"
							fill
							className="object-contain"
						/>
					</div>
					<span className="font-black text-[#030370] text-xl tracking-tighter">
						UNIEVENT
					</span>
				</Link>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2 sm:gap-4">
				{/* Host Only: Create Button */}
				{isHost && (
					<Link
						href="/events/create"
						className="hidden h-10 items-center gap-2 bg-[#030370] px-5 font-black text-[10px] text-white! uppercase tracking-widest transition-all hover:bg-slate-900 sm:flex"
					>
						<Plus size={14} />
						<span>Create Event</span>
					</Link>
				)}

				<div className="hidden h-10 items-center border border-slate-100 bg-slate-50 sm:flex">
					<button
						type="button"
						className="relative flex h-full items-center justify-center border-slate-100 border-r px-4 text-slate-400 transition-all hover:bg-white hover:text-[#030370]"
					>
						<Heart size={18} />
					</button>
					<button
						type="button"
						className="relative flex h-full items-center justify-center px-4 text-slate-400 transition-all hover:bg-white hover:text-[#030370]"
					>
						<Bell size={18} />
						{unreadCount > 0 && (
							<span className="absolute top-2.5 right-3.5 h-1.5 w-1.5 bg-rose-500" />
						)}
					</button>
				</div>

				<div className="mx-2 hidden h-8 w-px bg-slate-100 sm:block" />

				<Link
					href="/profile"
					className="group hidden items-center gap-3 border border-slate-100 bg-white py-1 pr-3 pl-1 transition-all hover:border-[#030370] hover:bg-slate-50 sm:flex"
				>
					<div className="flex h-8 w-8 items-center justify-center bg-[#030370] font-black text-white! text-xs transition-transform group-hover:rotate-6">
						{(user?.name || user?.email || "U")[0].toUpperCase()}
					</div>
					<div className="hidden min-w-0 text-left sm:block">
						<p className="max-w-[100px] truncate font-black text-[10px] text-slate-900 uppercase leading-none">
							{user?.name?.split(" ")[0] || "User"}
						</p>
					</div>
				</Link>

				<button
					type="button"
					onClick={() => setIsDrawerOpen((open) => !open)}
					className="flex h-10 w-10 items-center justify-center border border-[#dbe7ff] bg-[#f7f9ff] text-[#030370] transition-all hover:bg-white lg:hidden"
					aria-label={isDrawerOpen ? "Close app drawer" : "Open app drawer"}
				>
					{isDrawerOpen ? <X size={18} /> : <LayoutGrid size={18} />}
				</button>
			</div>

			{isDrawerOpen && (
				<div className="fixed inset-x-0 top-16 z-40 border-[#dbe7ff] border-b bg-white shadow-[0_20px_50px_-25px_rgba(3,3,112,0.35)] lg:hidden">
					<div className="px-4 py-4">
						<div className="grid grid-cols-3 gap-3">
							{mobileDrawerItems.map((item) => {
								const Icon = item.icon;
								const active =
									pathname === item.href ||
									pathname.startsWith(`${item.href}/`);

								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-center transition-all",
											active
												? "border-[#030370]/20 bg-[#030370]/5 text-[#030370]"
												: "border-slate-100 bg-slate-50 text-slate-600 hover:border-[#030370]/10 hover:bg-white",
										)}
									>
										<Icon size={18} />
										<span className="font-black text-[11px] tracking-wide">
											{item.label}
										</span>
									</Link>
								);
							})}
						</div>
					</div>

					<div className="border-[#dbe7ff] border-t p-3">
						<button
							type="button"
							onClick={() => signOut?.()}
							className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-rose-600 transition-all hover:bg-rose-50"
						>
							<LogOut size={16} />
							<span className="font-black text-sm">Logout</span>
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
