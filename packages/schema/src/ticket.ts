import { z } from "zod";
import { dateSchema, idSchema } from "./common";

// ── Ticket Tier ──

export const createTicketTierSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	price: z.number().int().min(0).default(0), // paise
	currency: z.string().length(3).default("INR"),
	quantity: z.number().int().positive().optional(), // null = unlimited
	minPerOrder: z.number().int().min(1).default(1),
	maxPerOrder: z.number().int().min(1).default(10),
	salesStart: dateSchema.optional(),
	salesEnd: dateSchema.optional(),
	visibility: z.enum(["PUBLIC", "HIDDEN", "INVITE_ONLY"]).default("PUBLIC"),
});

export type CreateTicketTierInput = z.infer<typeof createTicketTierSchema>;

export const updateTicketTierSchema = createTicketTierSchema.partial();

export type UpdateTicketTierInput = z.infer<typeof updateTicketTierSchema>;

// ── Promo Code ──

export const createPromoCodeSchema = z.object({
	code: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[A-Z0-9_-]+$/, "Must be uppercase alphanumeric"),
	type: z.enum(["PERCENT", "AMOUNT"]).default("PERCENT"),
	value: z.number().int().positive(),
	maxUses: z.number().int().positive().optional(),
	validFrom: dateSchema.optional(),
	validUntil: dateSchema.optional(),
});

export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;

export const updatePromoCodeSchema = createPromoCodeSchema.partial().extend({
	isActive: z.boolean().optional(),
});

export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeSchema>;

// ── Purchase Ticket ──

export const purchaseTicketSchema = z.object({
	tierId: idSchema,
	quantity: z.number().int().min(1).max(10).default(1),
	promoCode: z.string().optional(),
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;

// ── Check-in ──

export const checkInSchema = z.object({
	ticketCode: z.string().min(1),
	method: z.enum(["QR_SCAN", "MANUAL", "SELF"]).default("QR_SCAN"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

// ── Params ──

export const ticketTierParamsSchema = z.object({
	eventId: idSchema,
	tierId: idSchema.optional(),
});

export const ticketParamsSchema = z.object({
	ticketId: idSchema,
});
