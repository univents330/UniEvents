import {
	createPassSchema,
	idParamSchema,
	updatePassSchema,
	validatePassSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { passesController } from "./passes.controller";

export function createPassesRouter(): Router {
	const router = Router();

	router.get(
		"/",
		asyncHandler((req, res) => passesController.list(req, res)),
	);
	router.get(
		"/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => passesController.getById(req, res)),
	);
	router.post(
		"/",
		validatePipe({ body: createPassSchema }),
		asyncHandler((req, res) => passesController.create(req, res)),
	);
	router.patch(
		"/:id",
		validatePipe({ params: idParamSchema, body: updatePassSchema }),
		asyncHandler((req, res) => passesController.update(req, res)),
	);
	router.post(
		"/validate",
		validatePipe({ body: validatePassSchema }),
		asyncHandler((req, res) => passesController.validate(req, res)),
	);

	return router;
}
