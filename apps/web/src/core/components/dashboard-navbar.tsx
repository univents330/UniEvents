"use client";

import { Bell, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";

interface DashboardNavbarProps {
	title?: string;
	breadcrumbs?: Array<{ label: string; href?: string }>;
	onMenuToggle?: () => void;
	onNotificationToggle?: () => void;
	isMenuOpen?: boolean;
}

export function DashboardNavbar({
	title,
	breadcrumbs: _breadcrumbs,
	onMenuToggle,
	onNotificationToggle,
	isMenuOpen = false,
}: DashboardNavbarProps) {
	const { user } = useAuth();
	const _effectiveTitle = title?.trim() || "UniEvents";

	return (
		<nav className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-slate-200 border-b bg-white px-4 md:px-8">
			{/* Left Section - Menu Toggle & Title */}
			<div className="flex items-center gap-3">
				{onMenuToggle && (
					<button
						type="button"
						onClick={onMenuToggle}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-full border transition-all md:hidden",
							isMenuOpen
								? "border-[#c9d7ff] bg-[#eef3ff] text-[#030370] shadow-[0_0_0_1px_rgba(3,3,112,0.08)]"
								: "border-slate-200 bg-white text-slate-600 hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-[#030370]",
						)}
						aria-label="Open menu"
						aria-expanded={isMenuOpen}
					>
						<LayoutGrid className="h-4 w-4" />
					</button>
				)}
				<Link href="/" className="group flex shrink-0 items-center gap-3">
					<div className="relative h-10 w-10 overflow-hidden transition-transform group-hover:scale-110">
						<Image
							src="/assets/logo_circle_svg.svg"
							alt="UniEvent Logo"
							fill
							className="object-contain"
						/>
					</div>
					<span className="font-black text-2xl text-slate-900 uppercase tracking-tighter">
						UniEvent
					</span>
				</Link>
			</div>

			{/* Right Section - Profile */}
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onNotificationToggle}
					className="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
				>
					<Bell className="h-5 w-5" />
					<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
				</button>

				{user?.image && (
					<div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
						<Image
							src={user.image}
							alt={user.name || "User"}
							width={32}
							height={32}
							className="h-full w-full object-cover"
						/>
					</div>
				)}
				{!user?.image && (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 text-sm">
						{user?.name?.charAt(0).toUpperCase() || "U"}
					</div>
				)}
			</div>
		</nav>
	);
}
