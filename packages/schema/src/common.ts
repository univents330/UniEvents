import { z } from "zod";

// ── ID & Slug ──

export const idSchema = z.string().cuid();

export const slugSchema = z
	.string()
	.min(3)
	.max(80)
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		"Must be a valid slug (lowercase, hyphens only)",
	);

// ── Pagination ──

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

// ── Common params ──

export const idParamsSchema = z.object({
	id: idSchema,
});

export const slugParamsSchema = z.object({
	slug: slugSchema,
});

// ── Reusable fields ──

export const urlSchema = z.string().url().optional();
export const emailSchema = z.string().email();
export const dateSchema = z.coerce.date();
