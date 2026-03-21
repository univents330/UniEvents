import {
	addOrgMemberSchema,
	createOrgSchema,
	orgParamsSchema,
	updateOrgSchema,
} from "@voltaze/schema/org";
import type { Router as IRouter } from "express";
import { Router } from "express";
import * as ctrl from "../controllers/org.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router: IRouter = Router();

router.use(requireAuth);

router.post("/", validate({ body: createOrgSchema }), ctrl.create);
router.get("/", ctrl.list);
router.get("/:orgId", validate({ params: orgParamsSchema }), ctrl.getById);
router.patch(
	"/:orgId",
	validate({ params: orgParamsSchema, body: updateOrgSchema }),
	ctrl.update,
);
router.delete("/:orgId", validate({ params: orgParamsSchema }), ctrl.remove);

// Members
router.post(
	"/:orgId/members",
	validate({ params: orgParamsSchema, body: addOrgMemberSchema }),
	ctrl.addMember,
);
router.delete("/:orgId/members/:userId", ctrl.removeMember);

export default router;
