import {
	guestCheckoutSchema,
	guestVerifyPaymentSchema,
	idParamSchema,
} from "@unievent/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { guestCheckoutController } from "./guest-checkout.controller";

export function createGuestCheckoutRouter(): Router {
	const router = Router();

	// Public endpoint - no auth required for guest checkout
	router.post(
		"/initiate",
		validatePipe({ body: guestCheckoutSchema }),
		asyncHandler((req, res) => guestCheckoutController.initiate(req, res)),
	);

	router.post(
		"/verify",
		validatePipe({ body: guestVerifyPaymentSchema }),
		asyncHandler((req, res) => guestCheckoutController.verify(req, res)),
	);

	// Public endpoint for guests to fetch their payment details
	router.get(
		"/payments/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => guestCheckoutController.getPayment(req, res)),
	);

	return router;
}
