import { Router } from "express";
import {
	createTicket,
	deleteTicket,
	getTicket,
	getTicketsByEvent,
	updateTicket,
} from "../controller/ticket_controller";

const router: Router = Router();

router.post("/tickets", createTicket);
router.get("/tickets/:id", getTicket);
router.get("/tickets/event/:eventId", getTicketsByEvent);
router.patch("/tickets/:id", updateTicket);
router.delete("/tickets/:id", deleteTicket);

export default router;
