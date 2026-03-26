import { Router } from "express";
import {
	createTicket,
	deleteTicket,
	getTicket,
	getTicketsByEvent,
	updateTicket,
} from "../controller/ticket_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/tickets", requireAuth, createTicket);
router.get("/tickets/:id", requireAuth, getTicket);
router.get("/tickets/event/:eventId", requireAuth, getTicketsByEvent);
router.patch("/tickets/:id", requireAuth, updateTicket);
router.delete("/tickets/:id", requireAuth, deleteTicket);

export default router;
