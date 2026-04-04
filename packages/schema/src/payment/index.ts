import type { Payment } from "@voltaze/db";
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

export const initiatePaymentSchema = z.object({
	orderId: z.string().cuid(),
	currency: z
		.string()
		.trim()
		.regex(/^[A-Z]{3}$/)
		.default("INR"),
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

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RazorpayWebhookInput = z.infer<typeof razorpayWebhookSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
