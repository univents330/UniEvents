import type { Router as IRouter } from "express";
import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/payment.controller";
import { asyncHandler } from "../middleware/async-handler";
import { validate } from "../middleware/validate";

const router: IRouter = Router();

// Razorpay webhook — no auth (verified via signature)
router.post("/webhook", asyncHandler(ctrl.webhook));

// Initialize payment
router.post(
	"/initialize",
	validate({
		body: z.object({
			ticketId: z.string().min(1),
			amount: z.number().min(1),
			description: z.string().optional(),
		}),
	}),
	asyncHandler(ctrl.initializePayment),
);

// Get payment status
router.get("/:paymentId", asyncHandler(ctrl.getPaymentStatus));

// Create refund
router.post(
	"/:paymentId/refund",
	validate({
		body: z.object({
			amount: z.number().min(1).optional(),
			reason: z.string().optional(),
		}),
	}),
	asyncHandler(ctrl.createRefund),
);

export default router;
