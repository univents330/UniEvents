import db from "@voltaze/db";
import { AppError, NotFoundError } from "../lib/errors";
import { verifyWebhookSignature } from "../lib/razorpay";

export interface WebhookPayload {
	event: string;
	created_at: number;
	entity: {
		id: string; // Razorpay payment ID
		entity: string;
		order_id?: string; // Razorpay order ID
		amount: number;
		currency: string;
		status: string;
		method?: string;
		description?: string;
		amount_refunded?: number;
		refund_status?: string;
		captured?: boolean;
		email?: string;
		contact?: string;
		fee?: number;
		tax?: number;
		error_code?: string;
		error_description?: string;
		acquirer_data?: Record<string, unknown>;
		notes?: Record<string, unknown>;
		created_at?: number;
		payment_id?: string; // For refund events
	};
}

export async function handlePaymentSucceeded(payload: WebhookPayload) {
	const { entity } = payload;

	// Razorpay sends order_id in payment webhooks
	if (!entity.id || !entity.order_id) {
		throw new AppError("Missing id or order_id in webhook payload", 400);
	}

	// Find payment by Razorpay order ID (from initialize step)
	const payment = await db.payment.findUnique({
		where: { razorpayOrderId: entity.order_id },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// Update payment status with Razorpay payment ID from webhook
	await db.$transaction(async (tx) => {
		await tx.payment.update({
			where: { id: payment.id },
			data: {
				razorpayPaymentId: entity.id, // Store the actual payment ID from webhook
				orderStatus: "CAPTURED",
				paymentMethod: entity.method || null,
				paidAt: new Date(
					entity.created_at ? entity.created_at * 1000 : Date.now(),
				),
			},
		});

		// Increment sold count for the ticket tier
		const ticket = await tx.ticket.findUnique({
			where: { id: payment.ticketId },
		});

		if (ticket) {
			await tx.ticketTier.update({
				where: { id: ticket.tierId },
				data: { sold: { increment: 1 } },
			});
		}
	});
}

export async function handlePaymentFailed(payload: WebhookPayload) {
	const { entity } = payload;

	if (!entity.id || !entity.order_id) {
		throw new AppError("Missing id or order_id in webhook payload", 400);
	}

	// Find payment by Razorpay order ID
	const payment = await db.payment.findUnique({
		where: { razorpayOrderId: entity.order_id },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// Update payment status
	await db.payment.update({
		where: { id: payment.id },
		data: {
			razorpayPaymentId: entity.id,
			orderStatus: "FAILED",
		},
	});
}

export async function handleRefundCreated(payload: WebhookPayload) {
	const { entity } = payload;

	// For refund events, payment_id is in entity
	const paymentId = entity.payment_id;
	if (!paymentId) {
		throw new AppError("Missing payment_id in refund webhook payload", 400);
	}

	// Find payment by Razorpay payment ID
	const payment = await db.payment.findUnique({
		where: { razorpayPaymentId: paymentId },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// Update refund status
	await db.payment.update({
		where: { id: payment.id },
		data: {
			razorpayRefundId: entity.id,
			refundAmount: entity.amount,
			refundStatus: "PENDING",
		},
	});
}

export async function handleRefundProcessed(payload: WebhookPayload) {
	const { entity } = payload;

	const paymentId = entity.payment_id;
	if (!paymentId) {
		throw new AppError("Missing payment_id in refund webhook payload", 400);
	}

	// Find payment by Razorpay payment ID
	const payment = await db.payment.findUnique({
		where: { razorpayPaymentId: paymentId },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// Update refund status
	await db.payment.update({
		where: { id: payment.id },
		data: {
			refundStatus: "PROCESSED",
			refundedAt: new Date(),
		},
	});
}

export async function handleRefundFailed(payload: WebhookPayload) {
	const { entity } = payload;

	const paymentId = entity.payment_id;
	if (!paymentId) {
		throw new AppError("Missing payment_id in refund webhook payload", 400);
	}

	// Find payment by Razorpay payment ID
	const payment = await db.payment.findUnique({
		where: { razorpayPaymentId: paymentId },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// Update refund status
	await db.payment.update({
		where: { id: payment.id },
		data: {
			refundStatus: "FAILED",
		},
	});
}

export async function handleWebhook(
	signature: string,
	rawBody: string,
	payload: WebhookPayload,
) {
	// Verify signature
	const isValid = verifyWebhookSignature(rawBody, signature);
	if (!isValid) {
		throw new AppError("Invalid webhook signature", 400, "INVALID_SIGNATURE");
	}

	// Route to appropriate handler based on event type
	switch (payload.event) {
		case "payment.authorized":
		case "payment.captured":
			await handlePaymentSucceeded(payload);
			break;
		case "payment.failed":
			await handlePaymentFailed(payload);
			break;
		case "refund.created":
			await handleRefundCreated(payload);
			break;
		case "refund.processed":
			await handleRefundProcessed(payload);
			break;
		case "refund.failed":
			await handleRefundFailed(payload);
			break;
		default:
			// Ignore unknown events
			break;
	}
}
