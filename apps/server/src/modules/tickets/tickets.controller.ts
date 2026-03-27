import {
	createTicketSchema,
	idParamSchema,
	ticketFilterSchema,
	updateTicketSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { ticketsService } from "./tickets.service";

export class TicketsController {
	async list(req: Request, res: Response) {
		const query = ticketFilterSchema.parse(req.query);
		const tickets = await ticketsService.list(query);
		res.status(200).json(tickets);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const ticket = await ticketsService.getById(params.id);
		res.status(200).json(ticket);
	}

	async create(req: Request, res: Response) {
		const body = createTicketSchema.parse(req.body);
		const ticket = await ticketsService.create(body);
		res.status(201).json(ticket);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateTicketSchema.parse(req.body);
		const ticket = await ticketsService.update(params.id, body);
		res.status(200).json(ticket);
	}
}

export const ticketsController = new TicketsController();
