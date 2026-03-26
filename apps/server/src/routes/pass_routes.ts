import { Router } from "express";
import {
	createPass,
	getPass,
	getPassesByEvent,
	verifyPass,
} from "../controller/pass_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/passes", requireAuth, createPass);
router.get("/passes/:id", requireAuth, getPass);
router.get("/passes/event/:eventId", requireAuth, getPassesByEvent);
router.post("/passes/verify/:id", requireAuth, verifyPass);

export default router;
