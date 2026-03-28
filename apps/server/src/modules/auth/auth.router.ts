import {
	loginSchema,
	logoutSchema,
	refreshSessionSchema,
	registerSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { requireAuth } from "@/common/middlewares/auth.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { authController } from "./auth.controller";

export function createAuthRouter(): Router {
	const router = Router();

	router.get(
		"/me",
		requireAuth,
		asyncHandler((req, res) => authController.me(req, res)),
	);
	router.post(
		"/register",
		validatePipe({ body: registerSchema }),
		asyncHandler((req, res) => authController.register(req, res)),
	);
	router.post(
		"/login",
		validatePipe({ body: loginSchema }),
		asyncHandler((req, res) => authController.login(req, res)),
	);
	router.post(
		"/refresh",
		validatePipe({ body: refreshSessionSchema }),
		asyncHandler((req, res) => authController.refresh(req, res)),
	);
	router.post(
		"/logout",
		validatePipe({ body: logoutSchema }),
		asyncHandler((req, res) => authController.logout(req, res)),
	);

	return router;
}
