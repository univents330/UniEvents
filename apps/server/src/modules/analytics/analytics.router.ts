import { analyticsFilterSchema, idParamSchema } from "@unievent/schema";
import { Router } from "express";

import { requireAuth } from "@/common/middlewares/auth.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { analyticsController } from "./analytics.controller";

export function createAnalyticsRouter(): Router {
	const router = Router();

	router.get(
		"/events/:id",
		requireAuth,
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => analyticsController.getEventAnalytics(req, res)),
	);

	router.get(
		"/revenue",
		requireAuth,
		validatePipe({ query: analyticsFilterSchema }),
		asyncHandler((req, res) =>
			analyticsController.getRevenueAnalytics(req, res),
		),
	);

	router.get(
		"/attendees",
		requireAuth,
		validatePipe({ query: analyticsFilterSchema }),
		asyncHandler((req, res) =>
			analyticsController.getAttendeeAnalytics(req, res),
		),
	);

	return router;
}
