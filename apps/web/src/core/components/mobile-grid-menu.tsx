"use client";

import { LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import type { SidebarSection } from "./app-sidebar";

interface MobileGridMenuProps {
	isOpen: boolean;
	onClose: () => void;
	sections: SidebarSection[];
}

export function MobileGridMenu({
	isOpen,
	onClose,
	sections,
}: MobileGridMenuProps) {
	const pathname = usePathname();
	const { signOut } = useAuth();

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const isActive = (href: string) => {
		if (pathname === href) return true;
		return pathname.startsWith(`${href}/`);
	};

	const allItems = sections.flatMap((section) => section.items);

	const handleLogout = () => {
		signOut?.();
		onClose();
	};

	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity"
					onClick={onClose}
				/>
			)}

			{/* Grid Menu Dropdown */}
			<div
				className={cn(
					"fixed inset-x-0 top-16 z-40 w-full bg-white shadow-2xl transition-all duration-300 ease-out",
					isOpen
						? "visible translate-y-0 opacity-100"
						: "pointer-events-none invisible -translate-y-4 opacity-0",
				)}
			>
				<div className="flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto">
					{/* Header */}
					<div className="flex items-center justify-between border-[#dbe7ff] border-b px-4 py-3">
						<span className="font-semibold text-[#071a78] text-sm">Menu</span>
						<button
							type="button"
							onClick={onClose}
							className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
						>
							<X className="h-4 w-4 text-slate-500" />
						</button>
					</div>

					{/* Grid Menu Items */}
					<div className="flex-1 px-3 py-4">
						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							{allItems.map((item) => {
								const active = isActive(item.href);
								return (
									<button
										key={item.href}
										type="button"
										onClick={() => {
											window.location.assign(item.href);
											onClose();
										}}
										className={cn(
											"flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all active:scale-95",
											active
												? "bg-[#030370] text-white shadow-[#030370]/20 shadow-lg"
												: "bg-slate-50 text-slate-700 hover:bg-slate-100 active:bg-slate-200",
										)}
									>
										<span
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-lg",
												active ? "bg-white/20" : "bg-white shadow-sm",
											)}
										>
											{item.icon}
										</span>
										<span className="text-center font-medium text-xs leading-tight">
											{item.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Logout Button */}
					<div className="border-slate-200 border-t px-4 py-4">
						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 font-semibold text-rose-600 text-sm transition-colors active:bg-rose-100"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
