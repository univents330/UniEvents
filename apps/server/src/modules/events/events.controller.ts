import {
	createEventSchema,
	eventFilterSchema,
	idParamSchema,
	updateEventSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

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
		const body = createEventSchema.parse(req.body);
		const event = await eventsService.create(body);
		res.status(201).json(event);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateEventSchema.parse(req.body);
		const event = await eventsService.update(params.id, body);
		res.status(200).json(event);
	}
}

export const eventsController = new EventsController();
