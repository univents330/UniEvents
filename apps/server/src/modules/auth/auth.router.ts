import {
	createUserSchema,
	idParamSchema,
	updateUserSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { authController } from "./auth.controller";

export function createAuthRouter(): Router {
	const router = Router();

	router.get(
		"/users",
		asyncHandler((req, res) => authController.listUsers(req, res)),
	);
	router.get(
		"/users/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => authController.getUserById(req, res)),
	);
	router.post(
		"/users",
		validatePipe({ body: createUserSchema }),
		asyncHandler((req, res) => authController.createUser(req, res)),
	);
	router.patch(
		"/users/:id",
		validatePipe({ params: idParamSchema, body: updateUserSchema }),
		asyncHandler((req, res) => authController.updateUser(req, res)),
	);

	return router;
}
