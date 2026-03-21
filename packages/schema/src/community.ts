import { z } from "zod";
import { emailSchema, idSchema, slugSchema, urlSchema } from "./common";

// ── Community ──

export const createCommunitySchema = z.object({
	name: z.string().min(2).max(100),
	slug: slugSchema.optional(),
	description: z.string().max(500).optional(),
	logoUrl: urlSchema,
	coverUrl: urlSchema,
	access: z.enum(["OPEN", "APPLICATION", "INVITE_ONLY"]).default("OPEN"),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

export const updateCommunitySchema = createCommunitySchema.partial();

export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;

export const communityParamsSchema = z.object({
	communityId: idSchema,
});

// ── Invite ──

export const createInviteSchema = z.object({
	email: emailSchema,
	message: z.string().max(500).optional(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export const bulkInviteSchema = z.object({
	emails: z.array(emailSchema).min(1).max(100),
	message: z.string().max(500).optional(),
});

export type BulkInviteInput = z.infer<typeof bulkInviteSchema>;

// ── Waitlist ──

export const joinWaitlistSchema = z.object({
	email: emailSchema,
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

// ── Event Update (announcement) ──

export const createEventUpdateSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().min(1).max(5000),
	isPinned: z.boolean().default(false),
});

export type CreateEventUpdateInput = z.infer<typeof createEventUpdateSchema>;

// ── Registration form field ──

export const createFormFieldSchema = z.object({
	label: z.string().min(1).max(200),
	type: z
		.enum([
			"TEXT",
			"TEXTAREA",
			"EMAIL",
			"PHONE",
			"URL",
			"NUMBER",
			"DATE",
			"SELECT",
			"MULTISELECT",
			"CHECKBOX",
			"RADIO",
			"FILE",
			"CONSENT",
			"LINKEDIN",
		])
		.default("TEXT"),
	placeholder: z.string().max(200).optional(),
	helpText: z.string().max(500).optional(),
	isRequired: z.boolean().default(false),
	options: z.array(z.string()).optional(), // for SELECT, RADIO, etc.
	position: z.number().int().min(0).default(0),
});

export type CreateFormFieldInput = z.infer<typeof createFormFieldSchema>;

// ── Form response ──

export const submitFormResponseSchema = z.object({
	responses: z.array(
		z.object({
			fieldId: idSchema,
			value: z.string(),
		}),
	),
});

export type SubmitFormResponseInput = z.infer<typeof submitFormResponseSchema>;
