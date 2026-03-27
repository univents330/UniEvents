import {
	createTicketSchema,
	idParamSchema,
	ticketFilterSchema,
	updateTicketSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { ticketsController } from "./tickets.controller";

export function createTicketsRouter(): Router {
	const router = Router();

	router.get(
		"/",
		validatePipe({ query: ticketFilterSchema }),
		asyncHandler((req, res) => ticketsController.list(req, res)),
	);
	router.get(
		"/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => ticketsController.getById(req, res)),
	);
	router.post(
		"/",
		validatePipe({ body: createTicketSchema }),
		asyncHandler((req, res) => ticketsController.create(req, res)),
	);
	router.patch(
		"/:id",
		validatePipe({ params: idParamSchema, body: updateTicketSchema }),
		asyncHandler((req, res) => ticketsController.update(req, res)),
	);

	return router;
}
