"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth";

interface HostNavbarProps {
	title?: string;
	breadcrumbs?: Array<{ label: string; href?: string }>;
	onMenuToggle?: () => void;
}

export function HostNavbar({
	title,
	breadcrumbs,
	onMenuToggle,
}: HostNavbarProps) {
	const { data: user } = useCurrentUser();
	const safeName = user?.name?.trim() || "Host";
	const effectiveTitle = title?.trim() || `Hey ${safeName}`;

	const testClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		console.log("Button clicked! Event:", e);
		console.log("onMenuToggle exists:", !!onMenuToggle);
		console.log("onMenuToggle type:", typeof onMenuToggle);

		// Try to trigger the drawer directly
		if (onMenuToggle && typeof onMenuToggle === "function") {
			console.log("Calling onMenuToggle...");
			onMenuToggle();
		} else {
			console.error("onMenuToggle is not a function or is undefined");
		}
	};

	return (
		<nav className="fixed top-0 right-0 left-0 z-30 flex h-20 items-center justify-between border-[#dbe7ff] border-b bg-white/80 px-4 backdrop-blur-md md:left-64 md:px-8">
			{/* Left Section - Menu Toggle & Title/Breadcrumbs */}
			<div className="flex min-w-0 flex-1 items-center gap-4">
				{/* Hamburger Menu - Mobile Only */}
				<button
					type="button"
					onClick={testClick}
					onMouseDown={() => console.log("Mouse down on hamburger")}
					onMouseUp={() => console.log("Mouse up on hamburger")}
					onTouchStart={() => console.log("Touch start on hamburger")}
					className="pointer-events-auto relative z-50 rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 md:hidden"
					style={{ pointerEvents: "auto", zIndex: 9999 }}
				>
					<Menu className="h-5 w-5" />
				</button>
				{/* Title/Breadcrumbs */}
				<div className="min-w-0 flex-1">
					{breadcrumbs && !title ? (
						<div className="flex items-center gap-2 truncate text-[#4f6ea8] text-sm">
							{breadcrumbs.map((item, idx) => (
								<div key={idx} className="flex min-w-0 items-center gap-2">
									{idx > 0 && <span className="text-slate-300">/</span>}
									<span className="truncate">{item.label}</span>
								</div>
							))}
						</div>
					) : (
						<div className="min-w-0">
							<p className="font-semibold text-[#030370]/60 text-xs uppercase tracking-wide">
								Host Dashboard
							</p>
							<h1 className="truncate font-bold text-2xl text-[#071a78]">
								{effectiveTitle}
							</h1>
						</div>
					)}
				</div>
			</div>

			{/* Right Section - Notifications & Profile */}
			<div className="flex items-center gap-6">
				{/* Notifications */}
				<button
					type="button"
					className="relative rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
				>
					<Bell className="h-5 w-5" />
					<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
				</button>

				{/* Profile Info */}
				<div className="flex items-center gap-3 border-[#dbe7ff] border-l pl-6">
					{user?.image && (
						<div className="h-10 w-10 overflow-hidden rounded-full bg-violet-100">
							<Image
								src={user.image}
								alt={user.name || "User"}
								width={40}
								height={40}
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					{!user?.image && (
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#0a4bb8] to-[#245ed1] font-semibold text-sm text-white shadow-sm">
							{user?.name?.charAt(0).toUpperCase() || "U"}
						</div>
					)}
					<div className="hidden sm:block">
						<p className="max-w-45 truncate font-medium text-slate-900 text-sm">
							{user?.name}
						</p>
						<p className="max-w-45 truncate text-slate-500 text-xs">
							{user?.email}
						</p>
					</div>
				</div>
			</div>
		</nav>
	);
}
