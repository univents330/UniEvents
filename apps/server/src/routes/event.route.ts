import {
	createEventSchema,
	eventParamsSchema,
	eventQuerySchema,
	eventSlugParamsSchema,
	updateEventSchema,
} from "@voltaze/schema/event";
import { orgParamsSchema } from "@voltaze/schema/org";
import type { Router as IRouter } from "express";
import { Router } from "express";
import * as ctrl from "../controllers/event.controller";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router: IRouter = Router();

// Public
router.get("/", optionalAuth, validate({ query: eventQuerySchema }), ctrl.list);
router.get(
	"/:slug",
	optionalAuth,
	validate({ params: eventSlugParamsSchema }),
	ctrl.getBySlug,
);

// Org-scoped (authenticated)
router.post(
	"/org/:orgId",
	requireAuth,
	validate({ params: orgParamsSchema, body: createEventSchema }),
	ctrl.create,
);
router.get(
	"/org/:orgId",
	requireAuth,
	validate({ params: orgParamsSchema }),
	ctrl.listByOrg,
);

// CRUD by eventId (authenticated)
router.patch(
	"/:eventId",
	requireAuth,
	validate({ params: eventParamsSchema, body: updateEventSchema }),
	ctrl.update,
);
router.delete(
	"/:eventId",
	requireAuth,
	validate({ params: eventParamsSchema }),
	ctrl.remove,
);

export default router;
