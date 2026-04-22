import {
	markAllAsReadSchema,
	notificationFilterSchema,
	notificationIdParamSchema,
} from "@unievent/schema";
import { Router } from "express";

import { requireAuth } from "@/common/middlewares/auth.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { notificationsController } from "./notifications.controller";

export function createNotificationsRouter(): Router {
	const router = Router();

	router.get(
		"/",
		requireAuth,
		validatePipe({ query: notificationFilterSchema }),
		asyncHandler((req, res) => notificationsController.list(req, res)),
	);

	router.get(
		"/unread-count",
		requireAuth,
		asyncHandler((req, res) =>
			notificationsController.getUnreadCount(req, res),
		),
	);

	router.get(
		"/:id",
		requireAuth,
		validatePipe({ params: notificationIdParamSchema }),
		asyncHandler((req, res) => notificationsController.getById(req, res)),
	);

	router.post(
		"/",
		requireAuth,
		asyncHandler((req, res) => notificationsController.create(req, res)),
	);

	router.post(
		"/mark-all-read",
		requireAuth,
		validatePipe({ body: markAllAsReadSchema }),
		asyncHandler((req, res) => notificationsController.markAllAsRead(req, res)),
	);

	router.patch(
		"/:id",
		requireAuth,
		validatePipe({ params: notificationIdParamSchema }),
		asyncHandler((req, res) => notificationsController.update(req, res)),
	);

	router.delete(
		"/:id",
		requireAuth,
		validatePipe({ params: notificationIdParamSchema }),
		asyncHandler((req, res) => notificationsController.delete(req, res)),
	);

	return router;
}
