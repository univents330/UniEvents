import {
	createPaymentSchema,
	idParamSchema,
	razorpayWebhookSchema,
	updatePaymentSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { paymentsController } from "./payments.controller";

export function createPaymentsRouter(): Router {
	const router = Router();

	router.get(
		"/",
		asyncHandler((req, res) => paymentsController.list(req, res)),
	);
	router.get(
		"/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => paymentsController.getById(req, res)),
	);
	router.post(
		"/",
		validatePipe({ body: createPaymentSchema }),
		asyncHandler((req, res) => paymentsController.create(req, res)),
	);
	router.patch(
		"/:id",
		validatePipe({ params: idParamSchema, body: updatePaymentSchema }),
		asyncHandler((req, res) => paymentsController.update(req, res)),
	);
	router.post(
		"/webhook/razorpay",
		validatePipe({ body: razorpayWebhookSchema }),
		asyncHandler((req, res) => paymentsController.webhook(req, res)),
	);

	return router;
}
