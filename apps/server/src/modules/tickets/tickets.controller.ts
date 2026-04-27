import {
	createTicketSchema,
	idParamSchema,
	ticketFilterSchema,
	updateTicketSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { ticketsService } from "./tickets.service";

export class TicketsController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	async list(req: Request, res: Response) {
		const query = ticketFilterSchema.parse(req.query);
		const tickets = await ticketsService.list(query, this.getActor(req));
		res.status(200).json(tickets);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const ticket = await ticketsService.getById(params.id, this.getActor(req));
		res.status(200).json(ticket);
	}

	async create(req: Request, res: Response) {
		const body = createTicketSchema.parse(req.body);
		const ticket = await ticketsService.create(body, this.getActor(req));
		res.status(201).json(ticket);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateTicketSchema.parse(req.body);
		const ticket = await ticketsService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(ticket);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await ticketsService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}
}

export const ticketsController = new TicketsController();
