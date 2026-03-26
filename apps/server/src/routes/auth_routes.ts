import { Router } from "express";
import { getAuthenticatedUser } from "../controller/auth_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.get("/auth/me", requireAuth, getAuthenticatedUser);

export default router;
