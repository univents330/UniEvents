import {
	checkInSchema,
	createPromoCodeSchema,
	createTicketTierSchema,
	purchaseTicketSchema,
} from "@voltaze/schema/ticket";
import type { Router as IRouter } from "express";
import { Router } from "express";
import * as ctrl from "../controllers/ticket.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router: IRouter = Router();

// Tiers (admin)
router.post(
	"/events/:eventId/tiers",
	requireAuth,
	validate({ body: createTicketTierSchema }),
	ctrl.createTier,
);
router.get("/events/:eventId/tiers", ctrl.listTiers);
router.patch(
	"/tiers/:tierId",
	requireAuth,
	validate({ body: createTicketTierSchema.partial() }),
	ctrl.updateTier,
);
router.delete("/tiers/:tierId", requireAuth, ctrl.deleteTier);

// Promo codes (admin)
router.post(
	"/events/:eventId/promo-codes",
	requireAuth,
	validate({ body: createPromoCodeSchema }),
	ctrl.createPromoCode,
);
router.get("/events/:eventId/promo-codes", requireAuth, ctrl.listPromoCodes);

// Purchase (authenticated)
router.post(
	"/events/:eventId/purchase",
	requireAuth,
	validate({ body: purchaseTicketSchema }),
	ctrl.purchase,
);

// Check-in (authenticated)
router.post(
	"/check-in",
	requireAuth,
	validate({ body: checkInSchema }),
	ctrl.checkIn,
);

export default router;
