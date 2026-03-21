import { z } from "zod";
import { idSchema, slugSchema, urlSchema } from "./common";

// ── Create Organization ──

export const createOrgSchema = z.object({
	name: z.string().min(2).max(100),
	slug: slugSchema.optional(), // auto-generate from name if omitted
	description: z.string().max(500).optional(),
	logoUrl: urlSchema,
	website: urlSchema,
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

// ── Update Organization ──

export const updateOrgSchema = createOrgSchema.partial();

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;

// ── Params ──

export const orgParamsSchema = z.object({
	orgId: idSchema,
});

// ── Add Member ──

export const addOrgMemberSchema = z.object({
	userId: idSchema,
	role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export type AddOrgMemberInput = z.infer<typeof addOrgMemberSchema>;

// ── Update Member Role ──

export const updateOrgMemberSchema = z.object({
	role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export type UpdateOrgMemberInput = z.infer<typeof updateOrgMemberSchema>;
