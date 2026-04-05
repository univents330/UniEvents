import {
	createEventSchema,
	createEventTicketTierSchema,
	eventFilterSchema,
	eventSlugParamSchema,
	eventTicketTierIdParamsSchema,
	eventTicketTierParamsSchema,
	idParamSchema,
	ticketTierFilterSchema,
	updateEventSchema,
	updateEventTicketTierSchema,
} from "@voltaze/schema";
import { Router } from "express";

import {
	optionalAuth,
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
		optionalAuth,
		validatePipe({ query: eventFilterSchema }),
		asyncHandler((req, res) => eventsController.list(req, res)),
	);
	router.get(
		"/:eventId/ticket-tiers",
		optionalAuth,
		validatePipe({
			params: eventTicketTierParamsSchema,
			query: ticketTierFilterSchema,
		}),
		asyncHandler((req, res) => eventsController.listTicketTiers(req, res)),
	);
	router.get(
		"/:eventId/ticket-tiers/:tierId",
		optionalAuth,
		validatePipe({ params: eventTicketTierIdParamsSchema }),
		asyncHandler((req, res) => eventsController.getTicketTierById(req, res)),
	);
	router.get(
		"/slug/:slug",
		optionalAuth,
		validatePipe({ params: eventSlugParamSchema }),
		asyncHandler((req, res) => eventsController.getBySlug(req, res)),
	);
	router.get(
		"/:id",
		optionalAuth,
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
	router.delete(
		"/:id",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => eventsController.delete(req, res)),
	);
	router.post(
		"/:eventId/ticket-tiers",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({
			params: eventTicketTierParamsSchema,
			body: createEventTicketTierSchema,
		}),
		asyncHandler((req, res) => eventsController.createTicketTier(req, res)),
	);
	router.patch(
		"/:eventId/ticket-tiers/:tierId",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({
			params: eventTicketTierIdParamsSchema,
			body: updateEventTicketTierSchema,
		}),
		asyncHandler((req, res) => eventsController.updateTicketTier(req, res)),
	);
	router.delete(
		"/:eventId/ticket-tiers/:tierId",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: eventTicketTierIdParamsSchema }),
		asyncHandler((req, res) => eventsController.deleteTicketTier(req, res)),
	);

	return router;
}
