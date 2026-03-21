import { z } from "zod";
import { dateSchema, idSchema, urlSchema } from "./common";

// ── Agenda Track ──

export const createTrackSchema = z.object({
	name: z.string().min(1).max(100),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color")
		.optional(),
	position: z.number().int().min(0).default(0),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;

// ── Agenda Session ──

export const createSessionSchema = z
	.object({
		trackId: idSchema,
		title: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		type: z
			.enum([
				"TALK",
				"WORKSHOP",
				"PANEL",
				"BREAK",
				"NETWORKING",
				"KEYNOTE",
				"QA",
				"OTHER",
			])
			.default("TALK"),
		startsAt: dateSchema,
		endsAt: dateSchema,
		speakerIds: z.array(idSchema).default([]),
		position: z.number().int().min(0).default(0),
	})
	.refine((d) => d.endsAt > d.startsAt, {
		message: "End time must be after start time",
		path: ["endsAt"],
	});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ── Speaker ──

export const createSpeakerSchema = z.object({
	name: z.string().min(1).max(100),
	title: z.string().max(200).optional(),
	bio: z.string().max(2000).optional(),
	photoUrl: urlSchema,
	website: urlSchema,
	twitter: z.string().max(100).optional(),
	linkedin: urlSchema,
	position: z.number().int().min(0).default(0),
});

export type CreateSpeakerInput = z.infer<typeof createSpeakerSchema>;

// ── Sponsor ──

export const createSponsorSchema = z.object({
	name: z.string().min(1).max(100),
	tier: z
		.enum(["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "COMMUNITY"])
		.default("COMMUNITY"),
	logoUrl: urlSchema,
	website: urlSchema,
	description: z.string().max(500).optional(),
	position: z.number().int().min(0).default(0),
});

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>;

// ── Params ──

export const trackParamsSchema = z.object({
	eventId: idSchema,
	trackId: idSchema.optional(),
});

export const sessionParamsSchema = z.object({
	eventId: idSchema,
	sessionId: idSchema.optional(),
});

export const speakerParamsSchema = z.object({
	eventId: idSchema,
	speakerId: idSchema.optional(),
});

export const sponsorParamsSchema = z.object({
	eventId: idSchema,
	sponsorId: idSchema.optional(),
});
