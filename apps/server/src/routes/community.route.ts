import {
	createCommunitySchema,
	createInviteSchema,
	joinWaitlistSchema,
	updateCommunitySchema,
} from "@voltaze/schema/community";
import type { Router as IRouter } from "express";
import { Router } from "express";
import * as ctrl from "../controllers/community.controller";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router: IRouter = Router();

// Community
router.post(
	"/org/:orgId",
	requireAuth,
	validate({ body: createCommunitySchema }),
	ctrl.create,
);
router.get("/:communityId", ctrl.getById);
router.patch(
	"/:communityId",
	requireAuth,
	validate({ body: updateCommunitySchema }),
	ctrl.update,
);
router.post("/:communityId/join", requireAuth, ctrl.join);

// Invites (event-scoped)
router.post(
	"/events/:eventId/invites",
	requireAuth,
	validate({ body: createInviteSchema }),
	ctrl.createInvite,
);
router.get("/events/:eventId/invites", requireAuth, ctrl.listInvites);

// Waitlist (event-scoped)
router.post(
	"/events/:eventId/waitlist",
	optionalAuth,
	validate({ body: joinWaitlistSchema }),
	ctrl.joinWaitlist,
);
router.get("/events/:eventId/waitlist", requireAuth, ctrl.listWaitlist);

export default router;
