import {
	attendeeFilterSchema,
	createAttendeeSchema,
	idParamSchema,
	updateAttendeeSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { attendeesService } from "./attendees.service";

export class AttendeesController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			email: authReq.auth.email,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	async list(req: Request, res: Response) {
		const query = attendeeFilterSchema.parse(req.query);
		const attendees = await attendeesService.list(query, this.getActor(req));
		res.status(200).json(attendees);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const attendee = await attendeesService.getById(
			params.id,
			this.getActor(req),
		);
		res.status(200).json(attendee);
	}

	async create(req: Request, res: Response) {
		const body = createAttendeeSchema.parse(req.body);
		const attendee = await attendeesService.create(body, this.getActor(req));
		res.status(201).json(attendee);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateAttendeeSchema.parse(req.body);
		const attendee = await attendeesService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(attendee);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await attendeesService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}
}

export const attendeesController = new AttendeesController();
