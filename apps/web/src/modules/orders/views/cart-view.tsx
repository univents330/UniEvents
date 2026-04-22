"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	MapPin,
	Minus,
	Plus,
	ShieldCheck,
	ShoppingBag,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/core/providers/cart-provider";

export function CartView() {
	const {
		items,
		totalItems,
		totalPrice,
		updateQuantity,
		removeItem,
		cartStartedAt,
	} = useCart();
	const [timeLeft, setTimeLeft] = useState<string>("15:00");

	useEffect(() => {
		if (!cartStartedAt) return;
		const interval = setInterval(() => {
			const elapsed = Date.now() - cartStartedAt;
			const remaining = Math.max(0, 15 * 60 * 1000 - elapsed);
			const m = Math.floor(remaining / 60000);
			const s = Math.floor((remaining % 60000) / 1000);
			setTimeLeft(
				`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
			);
			if (remaining <= 0) clearInterval(interval);
		}, 1000);
		return () => clearInterval(interval);
	}, [cartStartedAt]);

	if (totalItems === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center bg-white p-6 text-center">
				<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-200">
					<ShoppingBag size={32} />
				</div>
				<h1 className="mb-2 font-bold text-2xl text-slate-900">
					Your cart is empty
				</h1>
				<p className="mb-8 max-w-sm text-slate-500">
					Looks like you haven't added any event passes to your cart yet.
				</p>
				<Link
					href="/discover"
					className="inline-flex items-center gap-2 font-bold text-blue-600 text-sm transition-colors hover:text-blue-700"
				>
					Browse events <ChevronRight size={16} />
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fcfcfc] py-20 font-jakarta text-slate-900">
			<div className="container mx-auto px-6">
				<div className="mx-auto max-w-6xl">
					{/* Subtle Step Indicator */}
					<div className="mb-12 flex items-center gap-4">
						<span className="font-bold text-blue-600 text-xs">Cart</span>
						<ChevronRight size={14} className="text-slate-300" />
						<span className="font-medium text-slate-400 text-xs">Checkout</span>
						<ChevronRight size={14} className="text-slate-300" />
						<span className="font-medium text-slate-400 text-xs">
							Confirmation
						</span>
					</div>

					<div className="flex flex-col gap-16 lg:flex-row">
						{/* Main Cart Content */}
						<div className="flex-1 space-y-10">
							<div className="flex items-end justify-between border-slate-200 border-b pb-8">
								<h1 className="font-bold text-4xl tracking-tight">
									Shopping Cart
								</h1>
								<p className="font-medium text-slate-500 text-sm">
									{totalItems} items
								</p>
							</div>

							<div className="divide-y divide-slate-100">
								{items.map((item) => (
									<div
										key={item.tierId}
										className="group flex flex-col items-start gap-8 py-8 sm:flex-row"
									>
										<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
											{item.image && (
												<Image
													src={item.image}
													alt={item.eventName}
													fill
													className="object-cover"
												/>
											)}
										</div>

										<div className="flex-1 space-y-4">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="cursor-pointer font-bold text-lg transition-colors hover:text-blue-600">
														{item.eventName}
													</h3>
													<p className="mt-0.5 font-medium text-blue-600 text-sm">
														{item.tierName} Pass
													</p>
												</div>
												<button
													type="button"
													onClick={() => removeItem(item.tierId)}
													className="text-slate-300 transition-colors hover:text-red-500"
												>
													<Trash2 size={18} />
												</button>
											</div>

											<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
												<div className="flex items-center gap-1.5 text-slate-500 text-xs">
													<Calendar size={14} className="text-slate-400" />
													<span>Official Event Node</span>
												</div>
												<div className="flex items-center gap-1.5 text-slate-500 text-xs">
													<MapPin size={14} className="text-slate-400" />
													<span>Verified Venue</span>
												</div>
											</div>

											<div className="flex items-center justify-between pt-4">
												<div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
													<button
														type="button"
														onClick={() =>
															updateQuantity(item.tierId, item.quantity - 1)
														}
														className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
													>
														<Minus size={14} />
													</button>
													<span className="w-8 text-center font-bold text-sm">
														{item.quantity}
													</span>
													<button
														type="button"
														onClick={() =>
															updateQuantity(item.tierId, item.quantity + 1)
														}
														className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
													>
														<Plus size={14} />
													</button>
												</div>
												<p className="font-bold text-lg">
													₹
													{(
														(item.price * item.quantity) /
														100
													).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>

							<Link
								href="/discover"
								className="inline-flex items-center gap-2 font-bold text-blue-600 text-sm hover:underline"
							>
								<Plus size={16} /> Add another event
							</Link>
						</div>

						{/* Sidebar Summary */}
						<div className="w-full space-y-6 lg:w-[380px]">
							<div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
								<h2 className="font-bold text-lg">Order Summary</h2>

								<div className="space-y-4">
									<div className="flex justify-between text-sm">
										<span className="text-slate-500">Subtotal</span>
										<span className="font-medium">
											₹{(totalPrice / 100).toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-slate-500">Taxes & Fees</span>
										<span className="font-medium text-emerald-600">
											Included
										</span>
									</div>
									<div className="my-2 h-px bg-slate-100" />
									<div className="flex items-end justify-between">
										<span className="font-bold text-sm">Total</span>
										<span className="font-bold text-3xl">
											₹{(totalPrice / 100).toLocaleString()}
										</span>
									</div>
								</div>

								<div className="space-y-4">
									<Link
										href="/checkout"
										className="!text-white flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 font-bold text-sm shadow-blue-600/10 shadow-lg transition-all hover:bg-blue-700 active:scale-[0.98]"
									>
										Continue to checkout
									</Link>
									<div className="flex items-center justify-center gap-2 font-medium text-[10px] text-slate-400 uppercase tracking-wider">
										<ShieldCheck size={14} className="text-emerald-500" />{" "}
										Secured via RazorPay
									</div>
								</div>

								<div className="border-slate-50 border-t pt-6">
									<div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
										<div className="flex items-center gap-3">
											<Clock size={16} className="text-slate-400" />
											<span className="font-medium text-slate-600 text-xs">
												Reserved for
											</span>
										</div>
										<span className="font-bold text-slate-900 text-sm tabular-nums">
											{timeLeft}
										</span>
									</div>
								</div>
							</div>

							<div className="space-y-3 rounded-2xl border border-slate-100 bg-white/50 p-6">
								<h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">
									Need help?
								</h3>
								<p className="text-slate-500 text-xs leading-relaxed">
									Have questions about your order or our refund policy? Contact
									our{" "}
									<Link
										href="/support"
										className="text-blue-600 hover:underline"
									>
										support team
									</Link>
									.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
