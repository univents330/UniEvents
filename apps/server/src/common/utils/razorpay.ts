import { env } from "@voltaze/env/server";
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
	key_id: env.RAZORPAY_KEY_ID,
	key_secret: env.RAZORPAY_KEY_SECRET,
});

export type RazorpayOrderOptions = {
	amount: number;
	currency: string;
	receipt: string;
	notes?: Record<string, string>;
};

export type RazorpayOrder = {
	id: string;
	entity: string;
	amount: number;
	amount_paid: number;
	amount_due: number;
	currency: string;
	receipt: string;
	status: "created" | "attempted" | "paid";
	attempts: number;
	notes: Record<string, string>;
	created_at: number;
};

export type RazorpayPayment = {
	id: string;
	entity: string;
	amount: number;
	currency: string;
	status: string;
	order_id: string;
	method: string;
	captured: boolean;
	refund_status: string | null;
	amount_refunded: number;
};

export type RazorpayRefund = {
	id: string;
	entity: string;
	amount: number;
	currency: string;
	payment_id: string;
	status: "pending" | "processed" | "failed";
	created_at: number;
};

export async function createRazorpayOrder(
	options: RazorpayOrderOptions,
): Promise<RazorpayOrder> {
	return razorpay.orders.create(options) as Promise<RazorpayOrder>;
}

export async function fetchRazorpayOrder(
	orderId: string,
): Promise<RazorpayOrder> {
	return razorpay.orders.fetch(orderId) as Promise<RazorpayOrder>;
}

export async function fetchRazorpayPayment(
	paymentId: string,
): Promise<RazorpayPayment> {
	return razorpay.payments.fetch(paymentId) as Promise<RazorpayPayment>;
}

export async function createRazorpayRefund(
	paymentId: string,
	options: {
		amount?: number;
		speed?: "normal" | "optimum";
		notes?: Record<string, string>;
	},
): Promise<RazorpayRefund> {
	return razorpay.payments.refund(
		paymentId,
		options,
	) as Promise<RazorpayRefund>;
}
