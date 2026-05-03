import { z } from "zod";

export const notificationTypeEnum = z.enum([
	"EVENT_CREATED",
	"EVENT_UPDATED",
	"EVENT_CANCELLED",
	"EVENT_REMINDER",
	"ORDER_CONFIRMED",
	"PAYMENT_SUCCESS",
	"PAYMENT_FAILED",
	"CHECK_IN_CONFIRMED",
	"PASS_ISSUED",
]);

export const notificationStatusEnum = z.enum(["UNREAD", "READ"]);

export const createNotificationSchema = z.object({
	type: notificationTypeEnum,
	title: z.string().min(1).max(200),
	message: z.string().min(1).max(1000),
	userId: z.string().optional(),
	eventId: z.string().cuid().optional(),
	orderId: z.string().cuid().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateNotificationSchema = z.object({
	status: notificationStatusEnum.optional(),
	readAt: z.coerce.date().optional(),
});

export const notificationFilterSchema = z.object({
	userId: z.string().optional(),
	type: notificationTypeEnum.optional(),
	status: notificationStatusEnum.optional(),
	eventId: z.string().cuid().optional(),
	orderId: z.string().cuid().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const notificationIdParamSchema = z.object({
	id: z.string().cuid(),
});

export const markAllAsReadSchema = z.object({
	userId: z.string(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
export type NotificationType = z.infer<typeof notificationTypeEnum>;
export type NotificationStatus = z.infer<typeof notificationStatusEnum>;
