import { Router } from "express";
import {
	createPass,
	getPass,
	getPassesByEvent,
	verifyPass,
} from "../controller/pass_controller";

const router: Router = Router();

router.post("/passes", createPass);
router.get("/passes/:id", getPass);
router.get("/passes/event/:eventId", getPassesByEvent);
router.post("/passes/verify/:id", verifyPass);

export default router;
