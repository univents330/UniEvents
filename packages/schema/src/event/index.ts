import type { Event, TicketTier } from "@unievent/db";
import { z } from "zod";

export type { Event, TicketTier };

const ulidSchema = z.string().min(10);

function validateDateRange(
	startDate: Date | null | undefined,
	endDate: Date | null | undefined,
	path: string,
	ctx: z.RefinementCtx,
) {
	if (!startDate || !endDate) {
		return;
	}

	if (endDate < startDate) {
		ctx.addIssue({
			code: "custom",
			path: [path],
			message: `${path} must be greater than or equal to start date`,
		});
	}
}

export const eventSchema = z.object({
	id: z.string().cuid(),
	name: z.string(),
	slug: z.string(),
	userId: ulidSchema.nullable(),
	coverUrl: z.string(),
	thumbnail: z.string(),
	venueName: z.string(),
	address: z.string(),
	latitude: z.string(),
	longitude: z.string(),
	timezone: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	type: z.enum(["FREE", "PAID"]),
	mode: z.enum(["ONLINE", "OFFLINE"]),
	visibility: z.enum(["PUBLIC", "PRIVATE"]),
	status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
	description: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<Event>;

export const eventRecordSchema = eventSchema
	.omit({
		startDate: true,
		endDate: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		startDate: z.string(),
		endDate: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	});

const createEventSchemaBase = eventSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		slug: true,
		userId: true,
		status: true,
	})
	.extend({
		name: z.string().min(1).max(200),
		coverUrl: z.string().url(),
		thumbnail: z.string().url(),
		venueName: z.string().min(1).max(200),
		address: z.string().min(1).max(500),
		latitude: z.string(),
		longitude: z.string(),
		timezone: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
		type: z.enum(["FREE", "PAID"]),
		mode: z.enum(["ONLINE", "OFFLINE"]),
		visibility: z.enum(["PUBLIC", "PRIVATE"]),
		description: z.string().min(1).max(5000),
	});

export const createEventSchema = createEventSchemaBase.superRefine(
	(value, ctx) => {
		validateDateRange(value.startDate, value.endDate, "endDate", ctx);
	},
);

export const updateEventSchema = createEventSchemaBase
	.partial()
	.extend({
		name: z.string().min(1).max(200).optional(),
		coverUrl: z.string().url().optional(),
		thumbnail: z.string().url().optional(),
		venueName: z.string().min(1).max(200).optional(),
		address: z.string().min(1).max(500).optional(),
		latitude: z.string().optional(),
		longitude: z.string().optional(),
		timezone: z.string().optional(),
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
		type: z.enum(["FREE", "PAID"]).optional(),
		mode: z.enum(["ONLINE", "OFFLINE"]).optional(),
		visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
		status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
		description: z.string().min(1).max(5000).optional(),
	})
	.superRefine((value, ctx) => {
		validateDateRange(value.startDate, value.endDate, "endDate", ctx);
	});

export const eventFilterSchema = z
	.object({
		userId: ulidSchema.optional(),
		status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
		type: z.enum(["FREE", "PAID"]).optional(),
		mode: z.enum(["ONLINE", "OFFLINE"]).optional(),
		visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
		search: z.string().optional(),
		startDateFrom: z.coerce.date().optional(),
		startDateTo: z.coerce.date().optional(),
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(100).default(20),
		sortBy: z.enum(["createdAt", "startDate", "name"]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
	})
	.superRefine((value, ctx) => {
		validateDateRange(
			value.startDateFrom,
			value.startDateTo,
			"startDateTo",
			ctx,
		);
	});

export const eventTicketTierParamsSchema = z.object({
	eventId: z.string().cuid(),
});

export const eventSlugParamSchema = z.object({
	slug: z.string().trim().min(1).max(255),
});

export const eventTicketTierIdParamsSchema = z.object({
	eventId: z.string().cuid(),
	tierId: z.string().cuid(),
});

export const ticketTierFilterSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const ticketTierSchema = z.object({
	id: z.string().cuid(),
	eventId: z.string().cuid(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().int(),
	maxQuantity: z.number().int(),
	soldCount: z.number().int(),
	salesStart: z.date().nullable(),
	salesEnd: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<TicketTier>;

export const ticketTierRecordSchema = ticketTierSchema
	.omit({
		salesStart: true,
		salesEnd: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		salesStart: z.string().nullable(),
		salesEnd: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string(),
	});

const createTicketTierSchemaBase = ticketTierSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		soldCount: true,
	})
	.extend({
		name: z.string().min(1).max(100),
		description: z.string().max(500).optional().nullable(),
		price: z.number().int().min(0),
		maxQuantity: z.number().int().positive(),
		salesStart: z.coerce.date().optional().nullable(),
		salesEnd: z.coerce.date().optional().nullable(),
	});

export const createTicketTierSchema = createTicketTierSchemaBase.superRefine(
	(value, ctx) => {
		validateDateRange(value.salesStart, value.salesEnd, "salesEnd", ctx);
	},
);

const updateTicketTierSchemaBase = createTicketTierSchemaBase.partial().extend({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).optional().nullable(),
	price: z.number().int().min(0).optional(),
	maxQuantity: z.number().int().positive().optional(),
	salesStart: z.coerce.date().optional().nullable(),
	salesEnd: z.coerce.date().optional().nullable(),
});

export const updateTicketTierSchema = updateTicketTierSchemaBase.superRefine(
	(value, ctx) => {
		validateDateRange(value.salesStart, value.salesEnd, "salesEnd", ctx);
	},
);

const createEventTicketTierSchemaBase = createTicketTierSchemaBase.omit({
	eventId: true,
});

export const createEventTicketTierSchema =
	createEventTicketTierSchemaBase.superRefine((value, ctx) => {
		validateDateRange(value.salesStart, value.salesEnd, "salesEnd", ctx);
	});

export const updateEventTicketTierSchema = updateTicketTierSchemaBase
	.omit({
		eventId: true,
	})
	.superRefine((value, ctx) => {
		validateDateRange(value.salesStart, value.salesEnd, "salesEnd", ctx);
	});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventRecord = z.infer<typeof eventRecordSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
export type TicketTierFilterInput = z.infer<typeof ticketTierFilterSchema>;
export type TicketTierRecord = z.infer<typeof ticketTierRecordSchema>;
export type CreateTicketTierInput = z.infer<typeof createTicketTierSchema>;
export type UpdateTicketTierInput = z.infer<typeof updateTicketTierSchema>;
export type CreateEventTicketTierInput = z.infer<
	typeof createEventTicketTierSchema
>;
export type UpdateEventTicketTierInput = z.infer<
	typeof updateEventTicketTierSchema
>;
