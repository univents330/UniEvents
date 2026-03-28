import {
	createEventSchema,
	eventFilterSchema,
	idParamSchema,
	updateEventSchema,
} from "@voltaze/schema";
import { Router } from "express";

import {
	requireAuth,
	requireRoles,
} from "@/common/middlewares/auth.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { eventsController } from "./events.controller";

export function createEventsRouter(): Router {
	const router = Router();

	router.get(
		"/",
		validatePipe({ query: eventFilterSchema }),
		asyncHandler((req, res) => eventsController.list(req, res)),
	);
	router.get(
		"/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => eventsController.getById(req, res)),
	);
	router.post(
		"/",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ body: createEventSchema }),
		asyncHandler((req, res) => eventsController.create(req, res)),
	);
	router.patch(
		"/:id",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: idParamSchema, body: updateEventSchema }),
		asyncHandler((req, res) => eventsController.update(req, res)),
	);

	return router;
}
