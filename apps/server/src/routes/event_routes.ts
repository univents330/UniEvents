import { Router } from "express";
import {
	createEvent,
	deleteEvent,
	getEventById,
	getEventBySlug,
	getEvents,
	updateEvent,
} from "../controller/event_controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/events", requireAuth, createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.get("/events/slug/:slug", getEventBySlug);
router.patch("/events/:id", requireAuth, updateEvent);
router.delete("/events/:id", requireAuth, deleteEvent);

export default router;
