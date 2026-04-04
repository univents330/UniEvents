import { z } from "zod";

const ulidSchema = z
	.string()
	.regex(/^[0-9A-HJKMNP-TV-Z]{26}$/i, "Invalid ULID");

export const idParamSchema = z.object({
	id: z.string().cuid(),
});

export const eventIdParamSchema = z.object({
	eventId: z.string().cuid(),
});

export const attendeeIdParamSchema = z.object({
	attendeeId: z.string().cuid(),
});

export const orderIdParamSchema = z.object({
	orderId: z.string().cuid(),
});

export const ticketIdParamSchema = z.object({
	ticketId: z.string().cuid(),
});

export const passIdParamSchema = z.object({
	passId: z.string().cuid(),
});

export const paymentIdParamSchema = z.object({
	paymentId: z.string().cuid(),
});

export const userIdParamSchema = z.object({
	userId: ulidSchema,
});

export const paginationMetaSchema = z.object({
	page: z.number().int().positive(),
	limit: z.number().int().positive(),
	total: z.number().int().nonnegative(),
	totalPages: z.number().int().nonnegative(),
	hasNextPage: z.boolean(),
	hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function createPaginationMeta(
	page: number,
	limit: number,
	total: number,
): PaginationMeta {
	const totalPages = Math.ceil(total / limit);
	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};
}

export type PaginatedResponse<T> = {
	data: T[];
	meta: PaginationMeta;
};
