import { Router } from "express";
import {
	createEvent,
	deleteEvent,
	getEventById,
	getEvents,
	updateEvent,
} from "../controller/event_controller";

const router: Router = Router();

router.post("/events", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.patch("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;
