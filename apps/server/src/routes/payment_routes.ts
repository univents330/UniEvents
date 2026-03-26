import { Router } from "express";
import {
	createPayment,
	getPayment,
	getPaymentByOrder,
	updatePayment,
} from "../controller/payment_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/payments", requireAuth, createPayment);
router.get("/payments/:id", requireAuth, getPayment);
router.get("/payments/order/:orderId", requireAuth, getPaymentByOrder);
router.patch("/payments/:id", requireAuth, updatePayment);

export default router;
