import { env } from "@voltaze/env/server";
import crypto from "crypto";
import Razorpay from "razorpay";

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
	key_id: env.RAZORPAY_KEY_ID,
	key_secret: env.RAZORPAY_KEY_SECRET,
});

// ── Create Order ──

export interface CreateOrderParams {
	orderId: string;
	amount: number; // in paise
	customerId: string;
	customerEmail: string;
	customerPhone?: string;
	description?: string;
	receipt?: string;
}

export interface RazorpayOrderResponse {
	id: string;
	entity: string;
	amount: number;
	amount_paid: number;
	amount_due: number;
	currency: string;
	receipt: string;
	offer_id?: string;
	status: string;
	attempts: number;
	notes: Record<string, unknown>;
	created_at: number;
}

export async function createRazorpayOrder(
	params: CreateOrderParams,
): Promise<RazorpayOrderResponse> {
	try {
		const order = await razorpayInstance.orders.create({
			amount: params.amount, // amount in paise
			currency: "INR",
			receipt: params.receipt || params.orderId,
			notes: {
				orderId: params.orderId,
				customerId: params.customerId,
			},
		});

		return order as RazorpayOrderResponse;
	} catch (error) {
		throw new Error(
			`Razorpay order creation failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

// ── Verify Payment Signature ──

export interface VerifyPaymentParams {
	razorpayOrderId: string;
	razorpayPaymentId: string;
	razorpaySignature: string;
}

export function verifyPaymentSignature(params: VerifyPaymentParams): boolean {
	const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

	const expectedSignature = crypto
		.createHmac("sha256", env.RAZORPAY_KEY_SECRET)
		.update(`${razorpayOrderId}|${razorpayPaymentId}`)
		.digest("hex");

	return expectedSignature === razorpaySignature;
}

// ── Verify Webhook Signature ──

export function verifyWebhookSignature(
	requestBody: string,
	signature: string,
): boolean {
	const expectedSignature = crypto
		.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
		.update(requestBody)
		.digest("hex");

	return expectedSignature === signature;
}

// ── Fetch Payment Details ──

export interface RazorpayPaymentResponse {
	id: string;
	entity: string;
	amount: number;
	currency: string;
	status: string;
	method: string;
	description?: string;
	amount_refunded: number;
	refund_status?: string;
	captured: boolean;
	order_id?: string;
	invoice_id?: string;
	email: string;
	contact?: string;
	notes?: Record<string, unknown>;
	fee?: number;
	tax?: number;
	error_code?: string;
	error_description?: string;
	error_source?: string;
	error_reason?: string;
	acquirer_data?: Record<string, unknown>;
	created_at: number;
}

export async function fetchPaymentDetails(
	paymentId: string,
): Promise<RazorpayPaymentResponse> {
	try {
		const payment = await razorpayInstance.payments.fetch(paymentId);
		return payment as RazorpayPaymentResponse;
	} catch (error) {
		throw new Error(
			`Razorpay fetch payment failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

// ── Create Refund ──

export interface CreateRefundParams {
	paymentId: string;
	amount?: number; // optional, in paise. If not provided, full refund
	receipt?: string;
}

export interface RazorpayRefundResponse {
	id: string;
	entity: string;
	payment_id: string;
	amount: number;
	reason?: string;
	receipt?: string;
	currency: string;
	status: string;
	speed_processed?: string;
	speed_requested: string;
	notes?: Record<string, unknown>;
	created_at: number;
}

export async function createRefund(
	params: CreateRefundParams,
): Promise<RazorpayRefundResponse> {
	try {
		const refund = await razorpayInstance.payments.refund(params.paymentId, {
			amount: params.amount,
			receipt: params.receipt,
		} as Parameters<typeof razorpayInstance.payments.refund>[1]);

		return refund as unknown as RazorpayRefundResponse;
	} catch (error) {
		throw new Error(
			`Razorpay refund creation failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

// ── Fetch Refund Details ──

export async function fetchRefundDetails(
	refundId: string,
): Promise<RazorpayRefundResponse> {
	try {
		const refund = await razorpayInstance.refunds.fetch(refundId);
		return refund as RazorpayRefundResponse;
	} catch (error) {
		throw new Error(
			`Razorpay fetch refund failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
