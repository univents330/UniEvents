import { type Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CreateNotificationInput,
	createPaginationMeta,
	type NotificationFilterInput,
	type UpdateNotificationInput,
} from "@unievent/schema";

import { ForbiddenError, NotFoundError } from "@/common/exceptions/app-error";

type NotificationActor = {
	userId: string;
	role: UserRole;
};

export class NotificationsService {
	private buildAccessWhere(
		actor: NotificationActor,
	): Prisma.NotificationWhereInput {
		if (actor.role === "ADMIN") {
			return {};
		}
		return { userId: actor.userId };
	}

	async list(input: NotificationFilterInput, actor: NotificationActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where: Prisma.NotificationWhereInput = {
			...filters,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.notification.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
				include: {
					event: { select: { id: true, name: true, slug: true } },
					order: { select: { id: true, status: true } },
				},
			}),
			prisma.notification.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: NotificationActor) {
		const notification = await prisma.notification.findFirst({
			where: { id, ...this.buildAccessWhere(actor) },
			include: {
				event: { select: { id: true, name: true, slug: true } },
				order: { select: { id: true, status: true } },
			},
		});

		if (!notification) {
			throw new NotFoundError("Notification not found");
		}

		return notification;
	}

	async create(input: CreateNotificationInput, actor: NotificationActor) {
		if (
			input.userId &&
			input.userId !== actor.userId &&
			actor.role !== "ADMIN"
		) {
			throw new ForbiddenError(
				"You can only create notifications for yourself",
			);
		}

		const { metadata, ...dataWithoutMetadata } = input;
		const userId = input.userId ?? actor.userId;

		return await prisma.notification.create({
			data: {
				...dataWithoutMetadata,
				userId,
				metadata: metadata as Prisma.InputJsonValue,
			},
		});
	}

	async update(
		id: string,
		input: UpdateNotificationInput,
		actor: NotificationActor,
	) {
		const notification = await prisma.notification.findUnique({
			where: { id },
		});

		if (!notification) {
			throw new NotFoundError("Notification not found");
		}

		if (notification.userId !== actor.userId && actor.role !== "ADMIN") {
			throw new ForbiddenError("You can only update your own notifications");
		}

		const updateData: Prisma.NotificationUpdateInput = {
			...input,
			...(input.status === "READ" ? { readAt: new Date() } : {}),
		};

		return await prisma.notification.update({
			where: { id },
			data: updateData,
		});
	}

	async delete(id: string, actor: NotificationActor) {
		const notification = await prisma.notification.findUnique({
			where: { id },
		});

		if (!notification) {
			throw new NotFoundError("Notification not found");
		}

		if (notification.userId !== actor.userId && actor.role !== "ADMIN") {
			throw new ForbiddenError("You can only delete your own notifications");
		}

		await prisma.notification.delete({ where: { id } });
	}

	async markAllAsRead(userId: string, actor: NotificationActor) {
		if (userId !== actor.userId && actor.role !== "ADMIN") {
			throw new ForbiddenError(
				"You can only mark your own notifications as read",
			);
		}

		await prisma.notification.updateMany({
			where: { userId, status: "UNREAD" },
			data: { status: "READ", readAt: new Date() },
		});
	}

	async getUnreadCount(userId: string, actor: NotificationActor) {
		if (userId !== actor.userId && actor.role !== "ADMIN") {
			throw new ForbiddenError("You can only view your own unread count");
		}

		const count = await prisma.notification.count({
			where: { userId, status: "UNREAD" },
		});

		return { count };
	}

	async createEventNotification(
		type: "EVENT_CREATED" | "EVENT_UPDATED" | "EVENT_CANCELLED",
		eventId: string,
		title: string,
		message: string,
	) {
		const event = await prisma.event.findUnique({
			where: { id: eventId },
			select: { userId: true },
		});

		if (!event?.userId) return null;

		return await prisma.notification.create({
			data: { type, title, message, userId: event.userId, eventId },
		});
	}

	async createOrderNotification(
		orderId: string,
		title: string,
		message: string,
	) {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { attendeeId: true },
		});

		if (!order) return null;

		const attendee = await prisma.attendee.findUnique({
			where: { id: order.attendeeId },
			select: { userId: true },
		});

		if (!attendee?.userId) return null;

		return await prisma.notification.create({
			data: {
				type: "ORDER_CONFIRMED",
				title,
				message,
				userId: attendee.userId,
				orderId,
			},
		});
	}

	async createPaymentNotification(
		orderId: string,
		type: "PAYMENT_SUCCESS" | "PAYMENT_FAILED",
		title: string,
		message: string,
	) {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { attendeeId: true },
		});

		if (!order) return null;

		const attendee = await prisma.attendee.findUnique({
			where: { id: order.attendeeId },
			select: { userId: true },
		});

		if (!attendee?.userId) return null;

		return await prisma.notification.create({
			data: { type, title, message, userId: attendee.userId, orderId },
		});
	}

	async createCheckInNotification(
		attendeeId: string,
		eventId: string,
		title: string,
		message: string,
	) {
		const attendee = await prisma.attendee.findUnique({
			where: { id: attendeeId },
			select: { userId: true },
		});

		if (!attendee?.userId) return null;

		return await prisma.notification.create({
			data: {
				type: "CHECK_IN_CONFIRMED",
				title,
				message,
				userId: attendee.userId,
				eventId,
			},
		});
	}
}

export const notificationsService = new NotificationsService();
