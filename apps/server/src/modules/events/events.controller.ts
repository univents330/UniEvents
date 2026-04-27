import {
	approveEventSchema,
	createEventSchema,
	createEventTicketTierSchema,
	eventFilterSchema,
	eventSlugParamSchema,
	eventTicketTierIdParamsSchema,
	eventTicketTierParamsSchema,
	idParamSchema,
	ticketTierFilterSchema,
	updateEventSchema,
	updateEventTicketTierSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type {
	AuthenticatedRequest,
	RequestWithAuth,
} from "@/common/types/auth-request";

import { eventsService } from "./events.service";

export class EventsController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	private getOptionalActor(req: Request) {
		const authReq = req as RequestWithAuth;

		if (!authReq.auth) {
			return undefined;
		}

		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	async list(req: Request, res: Response) {
		const query = eventFilterSchema.parse(req.query);
		const events = await eventsService.list(query, this.getOptionalActor(req));
		res.status(200).json(events);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const event = await eventsService.getById(
			params.id,
			this.getOptionalActor(req),
		);
		res.status(200).json(event);
	}

	async getBySlug(req: Request, res: Response) {
		const params = eventSlugParamSchema.parse(req.params);
		const event = await eventsService.getBySlug(
			params.slug,
			this.getOptionalActor(req),
		);
		res.status(200).json(event);
	}

	async create(req: Request, res: Response) {
		const body = createEventSchema.parse(req.body);
		const event = await eventsService.create(body, this.getActor(req).userId);
		res.status(201).json(event);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateEventSchema.parse(req.body);
		const event = await eventsService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(event);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await eventsService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}

	async listTicketTiers(req: Request, res: Response) {
		const params = eventTicketTierParamsSchema.parse(req.params);
		const query = ticketTierFilterSchema.parse(req.query);
		const ticketTiers = await eventsService.listTicketTiers(
			params.eventId,
			query,
			this.getOptionalActor(req),
		);
		res.status(200).json(ticketTiers);
	}

	async getTicketTierById(req: Request, res: Response) {
		const params = eventTicketTierIdParamsSchema.parse(req.params);
		const ticketTier = await eventsService.getTicketTierById(
			params.eventId,
			params.tierId,
			this.getOptionalActor(req),
		);
		res.status(200).json(ticketTier);
	}

	async createTicketTier(req: Request, res: Response) {
		const params = eventTicketTierParamsSchema.parse(req.params);
		const body = createEventTicketTierSchema.parse(req.body);
		const ticketTier = await eventsService.createTicketTier(
			params.eventId,
			body,
			this.getActor(req),
		);
		res.status(201).json(ticketTier);
	}

	async updateTicketTier(req: Request, res: Response) {
		const params = eventTicketTierIdParamsSchema.parse(req.params);
		const body = updateEventTicketTierSchema.parse(req.body);
		const ticketTier = await eventsService.updateTicketTier(
			params.eventId,
			params.tierId,
			body,
			this.getActor(req),
		);
		res.status(200).json(ticketTier);
	}

	async deleteTicketTier(req: Request, res: Response) {
		const params = eventTicketTierIdParamsSchema.parse(req.params);
		await eventsService.deleteTicketTier(
			params.eventId,
			params.tierId,
			this.getActor(req),
		);
		res.status(204).send();
	}

	async approve(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = approveEventSchema.parse(req.body);
		const event = await eventsService.approve(
			params.id,
			body.isApproved,
			this.getActor(req),
		);
		res.status(200).json(event);
	}
}

export const eventsController = new EventsController();
