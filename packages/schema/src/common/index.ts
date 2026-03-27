import { z } from "zod";

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
	userId: z.string().cuid(),
});
