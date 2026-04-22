"use client";

import {
	ChevronRight,
	Clock,
	ExternalLink,
	Loader2,
	Mail,
	MapPin,
	Phone,
	User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/core/providers/auth-provider";
import { useCart } from "@/core/providers/cart-provider";
import { useCreateAttendee } from "@/modules/attendees/hooks/use-attendees";
import { attendeesService } from "@/modules/attendees/services/attendees.service";
import { useCreateOrder } from "@/modules/orders/hooks/use-orders";
import { ordersService } from "@/modules/orders/services/orders.service";
import {
	useConfirmFreeOrder,
	useInitiatePayment,
	useVerifyPayment,
} from "@/modules/payments/hooks/use-payments";
import { Button } from "@/shared/ui/button";

declare global {
	interface Window {
		Razorpay: new (
			options: unknown,
		) => {
			open: () => void;
			on: (event: string, handler: (response: unknown) => void) => void;
		};
	}
}

export function CheckoutView() {
	const { user } = useAuth();
	const { items, totalItems, totalPrice, cartStartedAt } = useCart();
	const [timeLeft, setTimeLeft] = useState<string>("15:00");
	const [isProcessing, setIsProcessing] = useState(false);

	// Hooks
	const createAttendeeMutation = useCreateAttendee();
	const createOrderMutation = useCreateOrder();
	const initiateMutation = useInitiatePayment();
	const verifyMutation = useVerifyPayment();
	const confirmFreeMutation = useConfirmFreeOrder();

	// Form State
	const [formData, setFormData] = useState({
		email: user?.email || "",
		phone: "",
		fullName: user?.name || "",
		address: "",
		city: "",
		state: "",
		pinCode: "",
	});

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

	const handleRazorpayPayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isProcessing) return;

		if (!user) {
			toast.error("Please sign in to complete your purchase.");
			return;
		}

		if (totalPrice > 0 && !window.Razorpay) {
			toast.error("Razorpay SDK failed to load. Please check your connection.");
			return;
		}

		setIsProcessing(true);
		const loadingToast = toast.loading("Initializing secure transaction...");

		try {
			// 1. Group items by eventId (Current limitation: one event per order)
			const eventId = items[0].eventId;

			// 2. Create/Get Attendee Node
			let attendeeId: string;
			try {
				const attendee = await createAttendeeMutation.mutateAsync({
					eventId,
					userId: user.id,
					name: formData.fullName,
					email: formData.email,
					phone: formData.phone,
				});
				attendeeId = attendee.id;
			} catch (err: unknown) {
				if (err && typeof err === "object" && "response" in err) {
					const error = err as { response?: { status?: number } };
					if (error.response?.status === 409) {
						// If already registered, fetch the existing attendee ID
						const existing = await attendeesService.list({
							eventId,
							userId: user.id,
						});

						if (existing.data.length > 0) {
							attendeeId = existing.data[0].id;
						} else {
							throw new Error("Could not retrieve existing registration.");
						}
					} else {
						throw err;
					}
				} else {
					throw err;
				}
			}

			// 3. Generate Order Manifest
			let orderId: string;
			try {
				const order = await createOrderMutation.mutateAsync({
					eventId,
					attendeeId,
				});
				orderId = order.id;
			} catch (err: unknown) {
				if (err && typeof err === "object" && "response" in err) {
					const error = err as { response?: { status?: number } };
					if (error.response?.status === 409) {
						// If order exists, fetch the existing order ID
						const existing = await ordersService.list({
							eventId,
							attendeeId,
						});

						if (existing.data.length > 0) {
							orderId = existing.data[0].id;
						} else {
							throw new Error("Could not retrieve existing order manifest.");
						}
					} else {
						throw err;
					}
				} else {
					throw err;
				}
			}

			// 4. Bypass if FREE
			if (totalPrice === 0) {
				await confirmFreeMutation.mutateAsync({
					orderId,
					currency: "INR",
					items: items.map((item) => ({
						tierId: item.tierId,
						quantity: item.quantity,
					})),
				});

				toast.dismiss(loadingToast);
				toast.success("Registration successful!");
				window.location.href = "/checkout/success";
				return;
			}

			// 5. Initiate Gateway Protocol for PAID orders
			const initiationData = await initiateMutation.mutateAsync({
				orderId,
				currency: "INR",
				items: items.map((item) => ({
					tierId: item.tierId,
					quantity: item.quantity,
				})),
			});

			toast.dismiss(loadingToast);

			// 6. Open Razorpay Modal
			const options = {
				key: initiationData.razorpayKeyId,
				amount: initiationData.amount,
				currency: initiationData.currency,
				name: "UniEvent Platform",
				description: `Experience Access: ${items[0].eventName}`,
				image: "/assets/logo_circle_svg.svg",
				order_id: initiationData.razorpayOrderId,
				handler: async (response: unknown) => {
					if (!response || typeof response !== "object") {
						throw new Error("Invalid payment response");
					}
					const paymentResponse = response as {
						razorpay_order_id?: string;
						razorpay_payment_id?: string;
						razorpay_signature?: string;
					};
					if (
						!paymentResponse.razorpay_order_id ||
						!paymentResponse.razorpay_payment_id ||
						!paymentResponse.razorpay_signature
					) {
						throw new Error(
							"Invalid payment response: missing required fields",
						);
					}
					try {
						setIsProcessing(true);
						const verificationToast = toast.loading(
							"Verifying transaction node...",
						);

						await verifyMutation.mutateAsync({
							razorpayOrderId: paymentResponse.razorpay_order_id,
							razorpayPaymentId: paymentResponse.razorpay_payment_id,
							razorpaySignature: paymentResponse.razorpay_signature,
						});

						toast.dismiss(verificationToast);
						toast.success("Transaction Secured.");
						window.location.href = "/checkout/success";
					} catch (error) {
						console.error("Verification failed", error);
						toast.error("Verification Protocol Failed.");
						setIsProcessing(false);
					}
				},
				prefill: {
					name: formData.fullName,
					email: formData.email,
					contact: formData.phone,
				},
				notes: {
					address: formData.address,
				},
				theme: {
					color: "#000031",
				},
				modal: {
					ondismiss: () => {
						setIsProcessing(false);
						toast.info("Transaction Aborted.");
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (error: unknown) {
			console.error("Checkout initiation failed:", error);
			toast.dismiss(loadingToast);

			const errorMessage =
				error &&
				typeof error === "object" &&
				"response" in error &&
				error.response &&
				typeof error.response === "object" &&
				"data" in error.response &&
				error.response.data &&
				typeof error.response.data === "object" &&
				"message" in error.response.data &&
				typeof error.response.data.message === "string"
					? error.response.data.message
					: error instanceof Error
						? error.message
						: "Checkout Protocol Failed.";
			toast.error(errorMessage);
			setIsProcessing(false);
		}
	};

	if (totalItems === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center bg-white p-6 text-center font-jakarta">
				<h1 className="mb-2 font-bold text-2xl text-slate-900">
					No active manifest
				</h1>
				<p className="mb-8 max-w-xs text-slate-500">
					Your shopping session is currently empty.
				</p>
				<Link
					href="/discover"
					className="font-bold text-blue-600 text-sm hover:underline"
				>
					Return to Hub
				</Link>
			</div>
		);
	}

	return (
		<>
			<Script
				id="razorpay-checkout-js"
				src="https://checkout.razorpay.com/v1/checkout.js"
				strategy="lazyOnload"
			/>

			<div className="min-h-screen bg-[#fcfcfc] py-20 font-jakarta text-slate-900">
				<div className="container mx-auto px-6">
					<div className="mx-auto max-w-6xl">
						<div className="mb-12 flex items-center gap-4">
							<Link
								href="/cart"
								className="font-medium text-slate-400 text-xs uppercase tracking-widest transition-colors hover:text-blue-600"
							>
								Cart
							</Link>
							<ChevronRight size={12} className="text-slate-300" />
							<span className="font-bold text-blue-600 text-xs uppercase tracking-widest">
								Billing & Checkout
							</span>
						</div>

						<div className="flex flex-col gap-16 lg:flex-row">
							<div className="flex-1 space-y-12">
								<div className="border-slate-200 border-b pb-8">
									<h1 className="font-bold text-4xl tracking-tight">
										Checkout Details
									</h1>
									<p className="mt-2 font-medium text-slate-500 text-sm">
										Secure your digital passes through our encrypted
										institutional gateway.
									</p>
								</div>

								<form onSubmit={handleRazorpayPayment} className="space-y-12">
									{/* Contact Info */}
									<section className="space-y-8">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-black text-[10px] text-white">
												01
											</div>
											<h2 className="font-bold text-xl">Contact Details</h2>
										</div>

										<div className="grid grid-cols-1 gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:grid-cols-2">
											<div className="space-y-2">
												<label
													htmlFor="email"
													className="flex items-center gap-2 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
												>
													<Mail size={12} /> Email Address
												</label>
												<input
													id="email"
													type="email"
													required
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													placeholder="name@university.edu"
													className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none transition-all focus:border-blue-600"
												/>
											</div>
											<div className="space-y-2">
												<label
													htmlFor="phone"
													className="flex items-center gap-2 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
												>
													<Phone size={12} /> Phone Number
												</label>
												<input
													id="phone"
													type="tel"
													required
													value={formData.phone}
													onChange={(e) =>
														setFormData({ ...formData, phone: e.target.value })
													}
													placeholder="+91 00000 00000"
													className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none transition-all focus:border-blue-600"
												/>
											</div>
										</div>
									</section>

									{/* Billing Address */}
									<section className="space-y-8">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-black text-[10px] text-white">
												02
											</div>
											<h2 className="font-bold text-xl">Billing Information</h2>
										</div>

										<div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
											<div className="space-y-2">
												<label
													htmlFor="fullName"
													className="flex items-center gap-2 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
												>
													<UserIcon size={12} /> Full Name
												</label>
												<input
													id="fullName"
													type="text"
													required
													value={formData.fullName}
													onChange={(e) =>
														setFormData({
															...formData,
															fullName: e.target.value,
														})
													}
													placeholder="John Doe"
													className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none transition-all focus:border-blue-600"
												/>
											</div>

											<div className="space-y-2">
												<label
													htmlFor="address"
													className="flex items-center gap-2 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
												>
													<MapPin size={12} /> Street Address
												</label>
												<input
													id="address"
													type="text"
													required
													value={formData.address}
													onChange={(e) =>
														setFormData({
															...formData,
															address: e.target.value,
														})
													}
													placeholder="Hostel, Floor, Unit, etc."
													className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none transition-all focus:border-blue-600"
												/>
											</div>

											<div className="grid grid-cols-2 gap-6 md:grid-cols-3">
												<div className="space-y-2">
													<label
														htmlFor="city"
														className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
													>
														City
													</label>
													<input
														id="city"
														type="text"
														required
														value={formData.city}
														onChange={(e) =>
															setFormData({ ...formData, city: e.target.value })
														}
														placeholder="Kharar"
														className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none focus:border-blue-600"
													/>
												</div>
												<div className="space-y-2">
													<label
														htmlFor="state"
														className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
													>
														State
													</label>
													<input
														id="state"
														type="text"
														required
														value={formData.state}
														onChange={(e) =>
															setFormData({
																...formData,
																state: e.target.value,
															})
														}
														placeholder="Punjab"
														className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none focus:border-blue-600"
													/>
												</div>
												<div className="col-span-2 space-y-2 md:col-span-1">
													<label
														htmlFor="pinCode"
														className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
													>
														PIN Code
													</label>
													<input
														id="pinCode"
														type="text"
														required
														value={formData.pinCode}
														onChange={(e) =>
															setFormData({
																...formData,
																pinCode: e.target.value,
															})
														}
														placeholder="140301"
														className="h-12 w-full rounded-xl border border-slate-200 px-4 font-medium text-sm outline-none focus:border-blue-600"
													/>
												</div>
											</div>
										</div>
									</section>

									{/* Gateway Branding */}
									<section className="space-y-8">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-black text-[10px] text-white">
												03
											</div>
											<h2 className="font-bold text-xl">Secure Gateway</h2>
										</div>

										<div className="flex flex-col items-center justify-center space-y-6 rounded-3xl border-2 border-blue-100 bg-blue-50/20 p-8 text-center">
											<span className="font-black text-slate-900 text-xl uppercase italic tracking-tighter">
												Razorpay Secure
											</span>
											<p className="max-w-sm font-medium text-slate-500 text-xs">
												Verify your details above before proceeding. You will be
												redirected to the Razorpay modal to complete the
												transaction.
											</p>
										</div>
									</section>

									<Button
										type="submit"
										disabled={isProcessing}
										className="flex h-20 w-full items-center justify-center gap-4 rounded-2xl bg-blue-600 font-black text-[11px] text-white! uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20 transition-all hover:bg-blue-700"
									>
										{isProcessing ? (
											<>
												<Loader2 className="h-5 w-5 animate-spin" />
												Securing Protocol...
											</>
										) : (
											<>
												Pay ₹{(totalPrice / 100).toLocaleString()}{" "}
												<ExternalLink size={16} />
											</>
										)}
									</Button>
								</form>
							</div>

							{/* Sidebar Manifest */}
							<div className="w-full space-y-8 lg:w-[400px]">
								<div className="h-fit space-y-12 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm lg:sticky lg:top-32">
									<div className="flex items-center justify-between border-slate-50 border-b pb-6">
										<h2 className="font-black text-sm uppercase tracking-widest">
											Order Review
										</h2>
										<Link
											href="/cart"
											className="font-black text-[10px] text-blue-600 uppercase tracking-widest hover:underline"
										>
											Edit
										</Link>
									</div>

									<div className="space-y-8">
										{items.map((item) => (
											<div
												key={item.tierId}
												className="flex items-center gap-4"
											>
												<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
													{item.image && (
														<Image
															src={item.image}
															alt={item.eventName}
															fill
															className="object-cover"
														/>
													)}
												</div>
												<div className="min-w-0 flex-1">
													<h4 className="truncate font-black text-[10px] text-slate-900 uppercase tracking-tight">
														{item.eventName}
													</h4>
													<p className="mt-1 font-bold text-[9px] text-slate-400 uppercase tracking-widest">
														{item.tierName} × {item.quantity}
													</p>
												</div>
												<p className="font-black text-slate-900 text-xs">
													₹
													{(
														(item.price * item.quantity) /
														100
													).toLocaleString()}
												</p>
											</div>
										))}
									</div>

									<div className="space-y-6 border-slate-100 border-t pt-10">
										<div className="flex items-center justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest">
											<span>Subtotal</span>
											<span className="text-slate-900">
												₹{(totalPrice / 100).toLocaleString()}
											</span>
										</div>
										<div className="flex items-center justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest">
											<span>Protocol Fee</span>
											<span className="text-emerald-500 tracking-normal">
												Included
											</span>
										</div>
										<div className="flex items-end justify-between border-slate-200 border-t pt-10">
											<div className="space-y-1">
												<span className="font-black text-[10px] text-blue-600 uppercase tracking-widest">
													Total Due
												</span>
												<p className="font-black text-4xl text-[#000031] tracking-tighter">
													₹{(totalPrice / 100).toLocaleString()}
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-6 rounded-2xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Clock size={18} className="text-blue-400" />
												<p className="font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
													Reservation
												</p>
											</div>
											<span className="font-black text-2xl tabular-nums">
												{timeLeft}
											</span>
										</div>
										<div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
											<div
												className="h-full animate-pulse bg-blue-500"
												style={{ width: "60%" }}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
