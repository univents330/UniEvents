"use client";

import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useCart } from "@/core/providers/cart-provider";

export function CartWidget() {
	const { items, totalItems, totalPrice, removeItem } = useCart();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<div className="relative" ref={containerRef}>
			{/* Navbar Cart Trigger */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"group relative flex h-11 items-center gap-3 rounded-full border px-4 transition-all",
					isOpen
						? "border-[#000031] bg-[#000031] text-white"
						: "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-100 hover:text-blue-600",
				)}
			>
				<div className="relative">
					<ShoppingCart size={18} strokeWidth={2.5} />
					{totalItems > 0 && (
						<span
							className={cn(
								"absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full border-2 font-black text-[8px] transition-colors",
								isOpen
									? "border-[#000031] bg-blue-500 text-white"
									: "border-white bg-blue-600 text-white",
							)}
						>
							{totalItems}
						</span>
					)}
				</div>
			</button>

			{/* Mini-Cart Popover Dropdown */}
			{isOpen && (
				<div className="fade-in zoom-in-95 absolute top-full right-0 z-[100] mt-4 w-96 origin-top-right animate-in overflow-hidden rounded-[32px] border border-slate-100 bg-white p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] duration-300">
					<div className="space-y-6 p-6">
						<div className="flex items-center justify-between border-slate-50 border-b pb-4">
							<h3 className="font-black text-[#000031] text-sm uppercase tracking-widest">
								Selections
							</h3>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="text-slate-300 transition-colors hover:text-slate-900"
							>
								<X size={16} />
							</button>
						</div>

						{/* Scrollable Items Area */}
						<div className="custom-scrollbar max-h-[400px] space-y-6 overflow-y-auto pr-2">
							{items.length === 0 ? (
								<div className="py-12 text-center">
									<p className="font-bold text-slate-400 text-xs">
										Empty collection
									</p>
								</div>
							) : (
								items.map((item) => (
									<div key={item.tierId} className="group flex gap-4">
										<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
											{item.image ? (
												<Image
													src={item.image}
													alt={item.eventName}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center text-slate-200">
													<ShoppingCart size={16} />
												</div>
											)}
										</div>
										<div className="flex min-w-0 flex-1 flex-col justify-center">
											<h4 className="truncate font-black text-[#000031] text-[10px] uppercase tracking-tight">
												{item.eventName}
											</h4>
											<p className="mt-0.5 font-bold text-[9px] text-blue-600 uppercase tracking-widest">
												{item.tierName} × {item.quantity}
											</p>
											<p className="mt-1.5 font-black text-[#000031] text-xs">
												₹{((item.price * item.quantity) / 100).toLocaleString()}
											</p>
										</div>
										<button
											type="button"
											onClick={() => removeItem(item.tierId)}
											className="flex h-8 w-8 items-center justify-center text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
										>
											<Trash2 size={14} />
										</button>
									</div>
								))
							)}
						</div>
					</div>

					{/* Action Footer */}
					{items.length > 0 && (
						<div className="p-2 pt-0">
							<div className="space-y-6 rounded-[24px] bg-slate-50 p-6">
								<div className="flex items-end justify-between">
									<div className="space-y-0.5">
										<span className="font-black text-[8px] text-slate-400 uppercase tracking-widest">
											Total Accumulation
										</span>
										<p className="font-black text-2xl text-[#000031]">
											₹{(totalPrice / 100).toLocaleString()}
										</p>
									</div>
								</div>
								<Link
									href="/cart"
									onClick={() => setIsOpen(false)}
									className="!text-white flex h-14 items-center justify-center rounded-[18px] bg-[#000031] font-black text-[10px] uppercase tracking-[0.3em] shadow-[#000031]/10 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
								>
									Verify & Checkout <ArrowRight size={14} className="ml-3" />
								</Link>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
