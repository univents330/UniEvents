import { Router } from "express";
import {
	createOrder,
	getOrder,
	getOrdersByEvent,
	updateOrder,
} from "../controller/order_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/orders", requireAuth, createOrder);
router.get("/orders/:id", requireAuth, getOrder);
router.get("/orders/event/:eventId", requireAuth, getOrdersByEvent);
router.patch("/orders/:id", requireAuth, updateOrder);

export default router;
