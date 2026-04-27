import {
	createNotificationSchema,
	markAllAsReadSchema,
	notificationFilterSchema,
	notificationIdParamSchema,
	updateNotificationSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { notificationsService } from "./notifications.service";

export class NotificationsController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	async list(req: Request, res: Response) {
		const query = notificationFilterSchema.parse(req.query);
		const result = await notificationsService.list(query, this.getActor(req));
		res.status(200).json(result);
	}

	async getById(req: Request, res: Response) {
		const params = notificationIdParamSchema.parse(req.params);
		const result = await notificationsService.getById(
			params.id,
			this.getActor(req),
		);
		res.status(200).json(result);
	}

	async create(req: Request, res: Response) {
		const body = createNotificationSchema.parse(req.body);
		const result = await notificationsService.create(body, this.getActor(req));
		res.status(201).json(result);
	}

	async update(req: Request, res: Response) {
		const params = notificationIdParamSchema.parse(req.params);
		const body = updateNotificationSchema.parse(req.body);
		const result = await notificationsService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(result);
	}

	async delete(req: Request, res: Response) {
		const params = notificationIdParamSchema.parse(req.params);
		await notificationsService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}

	async markAllAsRead(req: Request, res: Response) {
		const body = markAllAsReadSchema.parse(req.body);
		await notificationsService.markAllAsRead(body.userId, this.getActor(req));
		res.status(200).json({ message: "All notifications marked as read" });
	}

	async getUnreadCount(req: Request, res: Response) {
		const actor = this.getActor(req);
		const result = await notificationsService.getUnreadCount(
			actor.userId,
			actor,
		);
		res.status(200).json(result);
	}
}

export const notificationsController = new NotificationsController();
