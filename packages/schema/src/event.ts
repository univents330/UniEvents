import { z } from "zod";
import {
	dateSchema,
	idSchema,
	paginationSchema,
	slugSchema,
	urlSchema,
} from "./common";

// ── Event format / visibility / status enums ──

const eventFormat = z.enum(["IN_PERSON", "ONLINE", "HYBRID"]);
const eventVisibility = z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]);
const eventStatus = z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]);

// ── Create Event ──

export const createEventSchema = z
	.object({
		title: z.string().min(3).max(200),
		slug: slugSchema.optional(),
		description: z.string().max(5000).optional(),
		summary: z.string().max(300).optional(),

		// Media
		coverUrl: urlSchema,
		thumbnailUrl: urlSchema,

		// Venue
		venueName: z.string().max(200).optional(),
		address: z.string().max(500).optional(),
		city: z.string().max(100).optional(),
		state: z.string().max(100).optional(),
		country: z.string().max(100).optional(),
		postalCode: z.string().max(20).optional(),
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
		onlineUrl: urlSchema,

		// Schedule
		timezone: z.string().default("UTC"),
		startsAt: dateSchema,
		endsAt: dateSchema,

		// Config
		format: eventFormat.default("IN_PERSON"),
		visibility: eventVisibility.default("PUBLIC"),
		capacity: z.number().int().positive().optional(),
		isApprovalRequired: z.boolean().default(false),

		// Series
		seriesId: idSchema.optional(),
	})
	.refine((data) => data.endsAt > data.startsAt, {
		message: "End date must be after start date",
		path: ["endsAt"],
	});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ── Update Event ──

export const updateEventSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	slug: slugSchema.optional(),
	description: z.string().max(5000).optional(),
	summary: z.string().max(300).optional(),
	coverUrl: urlSchema,
	thumbnailUrl: urlSchema,
	venueName: z.string().max(200).optional(),
	address: z.string().max(500).optional(),
	city: z.string().max(100).optional(),
	state: z.string().max(100).optional(),
	country: z.string().max(100).optional(),
	postalCode: z.string().max(20).optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	onlineUrl: urlSchema,
	timezone: z.string().optional(),
	startsAt: dateSchema.optional(),
	endsAt: dateSchema.optional(),
	format: eventFormat.optional(),
	visibility: eventVisibility.optional(),
	status: eventStatus.optional(),
	capacity: z.number().int().positive().optional(),
	isApprovalRequired: z.boolean().optional(),
	seriesId: idSchema.nullable().optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ── Params ──

export const eventParamsSchema = z.object({
	eventId: idSchema,
});

export const eventSlugParamsSchema = z.object({
	slug: slugSchema,
});

// ── Query (listing / filtering) ──

export const eventQuerySchema = paginationSchema.extend({
	status: eventStatus.optional(),
	visibility: eventVisibility.optional(),
	format: eventFormat.optional(),
	from: dateSchema.optional(),
	to: dateSchema.optional(),
	search: z.string().max(200).optional(),
});

export type EventQuery = z.infer<typeof eventQuerySchema>;

// ── Event Series ──

export const createEventSeriesSchema = z.object({
	name: z.string().min(3).max(200),
	slug: slugSchema.optional(),
	description: z.string().max(500).optional(),
});

export type CreateEventSeriesInput = z.infer<typeof createEventSeriesSchema>;
