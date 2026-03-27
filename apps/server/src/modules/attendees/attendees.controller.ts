import {
	attendeeFilterSchema,
	createAttendeeSchema,
	idParamSchema,
	updateAttendeeSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { attendeesService } from "./attendees.service";

export class AttendeesController {
	async list(req: Request, res: Response) {
		const query = attendeeFilterSchema.parse(req.query);
		const attendees = await attendeesService.list(query);
		res.status(200).json(attendees);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const attendee = await attendeesService.getById(params.id);
		res.status(200).json(attendee);
	}

	async create(req: Request, res: Response) {
		const body = createAttendeeSchema.parse(req.body);
		const attendee = await attendeesService.create(body);
		res.status(201).json(attendee);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateAttendeeSchema.parse(req.body);
		const attendee = await attendeesService.update(params.id, body);
		res.status(200).json(attendee);
	}
}

export const attendeesController = new AttendeesController();
