import type { Payment } from "@unievent/db";
import { z } from "zod";

export type { Payment };

export const paymentSchema = z.object({
	id: z.string().cuid(),
	orderId: z.string().cuid(),
	amount: z.number().int(),
	currency: z.string(),
	gateway: z.enum(["RAZORPAY"]),
	transactionId: z.string().nullable(),
	gatewayMeta: z.any().nullable(),
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]),
	deletedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<Payment>;

export const createPaymentSchema = paymentSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		transactionId: true,
		gatewayMeta: true,
		status: true,
	})
	.extend({
		orderId: z.string().cuid(),
		amount: z.number().int().positive(),
		currency: z
			.string()
			.trim()
			.regex(/^[A-Z]{3}$/)
			.default("INR"),
		gateway: z.enum(["RAZORPAY"]),
	});

export const razorpayOrderOptionsSchema = z.object({
	amount: z.number().int().positive(),
	currency: z
		.string()
		.trim()
		.regex(/^[A-Z]{3}$/),
	receipt: z.string().min(1),
	notes: z.record(z.string(), z.string()).optional(),
});

export const razorpayOrderSchema = z.object({
	id: z.string(),
	entity: z.string(),
	amount: z.number().int(),
	amount_paid: z.number().int(),
	amount_due: z.number().int(),
	currency: z.string(),
	receipt: z.string(),
	status: z.enum(["created", "attempted", "paid"]),
	attempts: z.number().int().nonnegative(),
	notes: z.record(z.string(), z.string()),
	created_at: z.number().int().nonnegative(),
});

export const razorpayPaymentSchema = z.object({
	id: z.string(),
	entity: z.string(),
	amount: z.number().int(),
	currency: z.string(),
	status: z.string(),
	order_id: z.string(),
	method: z.string(),
	captured: z.boolean(),
	refund_status: z.string().nullable(),
	amount_refunded: z.number().int().nonnegative(),
});

export const razorpayRefundSchema = z.object({
	id: z.string(),
	entity: z.string(),
	amount: z.number().int(),
	currency: z.string(),
	payment_id: z.string(),
	status: z.enum(["pending", "processed", "failed"]),
	created_at: z.number().int().nonnegative(),
});

export const razorpayCheckoutResponseSchema = z.object({
	razorpay_payment_id: z.string(),
	razorpay_order_id: z.string(),
	razorpay_signature: z.string(),
});

export const updatePaymentSchema = createPaymentSchema.partial().extend({
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
	transactionId: z.string().optional().nullable(),
	gatewayMeta: z.unknown().optional().nullable(),
});

export const razorpayWebhookEventSchema = z.enum([
	"payment.authorized",
	"payment.captured",
	"payment.failed",
	"payment.refunded",
]);

export const razorpayPaymentStatusSchema = z.enum([
	"authorized",
	"captured",
	"failed",
	"refunded",
	"created",
]);

export const razorpayWebhookSchema = z.object({
	event: razorpayWebhookEventSchema,
	payload: z.object({
		payment: z.object({
			id: z.string(),
			order_id: z.string(),
			amount: z.number().int(),
			currency: z.string(),
			status: razorpayPaymentStatusSchema,
		}),
	}),
});

export const paymentFilterSchema = z.object({
	orderId: z.string().cuid().optional(),
	currency: z
		.string()
		.trim()
		.regex(/^[A-Z]{3}$/)
		.optional(),
	gateway: z.enum(["RAZORPAY"]).optional(),
	status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
	transactionId: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "amount", "status"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const initiatePaymentItemSchema = z.object({
	tierId: z.string().cuid(),
	quantity: z.coerce.number().int().positive().max(20),
});

export const ticketHolderSchema = z.object({
	tierId: z.string().cuid(),
	name: z.string().trim().min(1).max(100),
	email: z.string().email(),
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/)
		.optional()
		.nullable(),
});

function validatePaymentItems(
	items: Array<{ tierId: string; quantity: number }>,
	ctx: z.RefinementCtx,
) {
	const seenTierIds = new Set<string>();

	for (let index = 0; index < items.length; index++) {
		const item = items[index];
		if (!item) {
			continue;
		}

		if (seenTierIds.has(item.tierId)) {
			ctx.addIssue({
				code: "custom",
				path: ["items", index, "tierId"],
				message: "Duplicate tierId in checkout items",
			});
		}

		seenTierIds.add(item.tierId);
	}
}

function validateTicketHolders(
	args: {
		items: Array<{ tierId: string; quantity: number }>;
		ticketHolders?: Array<{ tierId: string }>;
	},
	ctx: z.RefinementCtx,
) {
	if (!args.ticketHolders) {
		return;
	}

	const totalQuantity = args.items.reduce(
		(total, item) => total + item.quantity,
		0,
	);

	if (args.ticketHolders.length !== totalQuantity) {
		ctx.addIssue({
			code: "custom",
			path: ["ticketHolders"],
			message: "ticketHolders length must equal total checkout quantity",
		});
	}

	const allowedTierIds = new Set(args.items.map((item) => item.tierId));
	for (let index = 0; index < args.ticketHolders.length; index++) {
		const holder = args.ticketHolders[index];
		if (!holder) {
			continue;
		}

		if (!allowedTierIds.has(holder.tierId)) {
			ctx.addIssue({
				code: "custom",
				path: ["ticketHolders", index, "tierId"],
				message: "ticket holder tierId must exist in checkout items",
			});
		}
	}
}

export const initiatePaymentSchema = z
	.object({
		orderId: z.string().cuid(),
		currency: z
			.string()
			.trim()
			.regex(/^[A-Z]{3}$/)
			.default("INR"),
		items: z.array(initiatePaymentItemSchema).min(1).optional(),
		ticketHolders: z.array(ticketHolderSchema).optional(),
	})
	.superRefine((value, ctx) => {
		if (!value.items || value.items.length === 0) {
			return;
		}

		validatePaymentItems(value.items, ctx);
		validateTicketHolders(
			{
				items: value.items,
				ticketHolders: value.ticketHolders,
			},
			ctx,
		);
	});

export const confirmFreeOrderSchema = z
	.object({
		orderId: z.string().cuid(),
		currency: z
			.string()
			.trim()
			.regex(/^[A-Z]{3}$/)
			.default("INR"),
		items: z.array(initiatePaymentItemSchema).min(1),
		ticketHolders: z.array(ticketHolderSchema).optional(),
	})
	.superRefine((value, ctx) => {
		validatePaymentItems(value.items, ctx);
		validateTicketHolders(
			{
				items: value.items,
				ticketHolders: value.ticketHolders,
			},
			ctx,
		);
	});

export const verifyPaymentSchema = z.object({
	razorpayOrderId: z.string(),
	razorpayPaymentId: z.string(),
	razorpaySignature: z.string(),
});

export const refundPaymentSchema = z.object({
	amount: z.number().int().positive().optional(),
	notes: z.record(z.string(), z.string()).optional(),
});

export const initiatePaymentResponseSchema = z.object({
	payment: paymentSchema,
	razorpayOrderId: z.string(),
	amount: z.number().int().positive(),
	currency: z
		.string()
		.trim()
		.regex(/^[A-Z]{3}$/),
	razorpayKeyId: z.string(),
	checkoutItems: z.array(initiatePaymentItemSchema).optional(),
	prefill: z
		.object({
			name: z.string().optional(),
			email: z.string().email().optional(),
			contact: z.string().optional(),
		})
		.optional(),
	notes: z.record(z.string(), z.string()).optional(),
});

export const verifyPaymentResponseSchema = z.object({
	payment: paymentSchema,
	alreadyVerified: z.boolean(),
});

export const checkoutDraftItemSchema = initiatePaymentItemSchema;

export const checkoutDraftTicketHolderSchema = z.object({
	tierId: z.string().cuid(),
	name: z.string().trim().min(1).max(100),
	email: z.string().email(),
	phone: z.string(),
});

export const checkoutDraftSchema = z.object({
	eventId: z.string().cuid(),
	eventSlug: z.string().trim().min(1),
	items: z.array(checkoutDraftItemSchema).min(1),
	purchaserName: z.string().trim().min(1).max(100),
	purchaserEmail: z.string().email(),
	purchaserPhone: z.string(),
	ticketHolders: z.array(checkoutDraftTicketHolderSchema),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RazorpayWebhookInput = z.infer<typeof razorpayWebhookSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type RazorpayOrderOptions = z.infer<typeof razorpayOrderOptionsSchema>;
export type RazorpayOrder = z.infer<typeof razorpayOrderSchema>;
export type RazorpayPayment = z.infer<typeof razorpayPaymentSchema>;
export type RazorpayRefund = z.infer<typeof razorpayRefundSchema>;
export type RazorpayCheckoutResponse = z.infer<
	typeof razorpayCheckoutResponseSchema
>;
export type InitiatePaymentItemInput = z.infer<
	typeof initiatePaymentItemSchema
>;
export type TicketHolderInput = z.infer<typeof ticketHolderSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ConfirmFreeOrderInput = z.infer<typeof confirmFreeOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type InitiatePaymentResponse = z.infer<
	typeof initiatePaymentResponseSchema
>;
export type VerifyPaymentResponse = z.infer<typeof verifyPaymentResponseSchema>;
export type CheckoutDraftItem = z.infer<typeof checkoutDraftItemSchema>;
export type CheckoutDraftTicketHolder = z.infer<
	typeof checkoutDraftTicketHolderSchema
>;
export type CheckoutDraft = z.infer<typeof checkoutDraftSchema>;

export type RazorpayCheckoutOptions = {
	key: string;
	amount: number;
	currency: string;
	order_id: string;
	name: string;
	description?: string;
	image?: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	notes?: Record<string, string>;
	theme?: {
		color?: string;
	};
	modal?: {
		ondismiss?: () => void;
	};
	handler?: (response: RazorpayCheckoutResponse) => void | Promise<void>;
};
