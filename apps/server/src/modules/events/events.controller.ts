import {
	createEventSchema,
	eventFilterSchema,
	idParamSchema,
	updateEventSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { eventsService } from "./events.service";

export class EventsController {
	async list(req: Request, res: Response) {
		const query = eventFilterSchema.parse(req.query);
		const events = await eventsService.list(query);
		res.status(200).json(events);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const event = await eventsService.getById(params.id);
		res.status(200).json(event);
	}

	async create(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const body = createEventSchema.parse(req.body);
		const event = await eventsService.create(body, authReq.auth.userId);
		res.status(201).json(event);
	}

	async update(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const params = idParamSchema.parse(req.params);
		const body = updateEventSchema.parse(req.body);
		const event = await eventsService.update(params.id, body, {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
		});
		res.status(200).json(event);
	}
}

export const eventsController = new EventsController();
