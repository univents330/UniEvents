import {
	confirmFreeOrderSchema,
	idParamSchema,
	initiatePaymentSchema,
	paymentFilterSchema,
	razorpayWebhookSchema,
	refundPaymentSchema,
	updatePaymentSchema,
	verifyPaymentSchema,
} from "@voltaze/schema";
import { Router } from "express";

import {
	requireAuth,
	requireRoles,
} from "@/common/middlewares/auth.middleware";
import { verifyRazorpayWebhookSignature } from "@/common/middlewares/payments.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { paymentsController } from "./payments.controller";

export function createPaymentsRouter(): Router {
	const router = Router();

	router.get(
		"/",
		requireAuth,
		validatePipe({ query: paymentFilterSchema }),
		asyncHandler((req, res) => paymentsController.list(req, res)),
	);
	router.get(
		"/:id",
		requireAuth,
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => paymentsController.getById(req, res)),
	);
	router.post(
		"/initiate",
		requireAuth,
		validatePipe({ body: initiatePaymentSchema }),
		asyncHandler((req, res) => paymentsController.initiate(req, res)),
	);
	router.post(
		"/free-confirm",
		requireAuth,
		validatePipe({ body: confirmFreeOrderSchema }),
		asyncHandler((req, res) => paymentsController.confirmFreeOrder(req, res)),
	);
	router.post(
		"/verify",
		requireAuth,
		validatePipe({ body: verifyPaymentSchema }),
		asyncHandler((req, res) => paymentsController.verify(req, res)),
	);
	router.post(
		"/:id/refund",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: idParamSchema, body: refundPaymentSchema }),
		asyncHandler((req, res) => paymentsController.refund(req, res)),
	);
	router.patch(
		"/:id",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: idParamSchema, body: updatePaymentSchema }),
		asyncHandler((req, res) => paymentsController.update(req, res)),
	);
	router.delete(
		"/:id",
		requireAuth,
		requireRoles("ADMIN", "HOST"),
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => paymentsController.delete(req, res)),
	);
	router.post(
		"/webhook/razorpay",
		verifyRazorpayWebhookSignature,
		validatePipe({ body: razorpayWebhookSchema }),
		asyncHandler((req, res) => paymentsController.webhook(req, res)),
	);

	return router;
}
