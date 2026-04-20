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

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RazorpayWebhookInput = z.infer<typeof razorpayWebhookSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type InitiatePaymentItemInput = z.infer<
	typeof initiatePaymentItemSchema
>;
export type TicketHolderInput = z.infer<typeof ticketHolderSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ConfirmFreeOrderInput = z.infer<typeof confirmFreeOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
