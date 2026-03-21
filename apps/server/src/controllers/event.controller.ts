import type { Request, Response } from "express";
import * as eventService from "../services/event.service";

function param(req: Request, key: string): string {
	const val = req.params[key];
	return Array.isArray(val) ? val[0]! : val!;
}

export async function create(req: Request, res: Response) {
	const event = await eventService.createEvent(
		param(req, "orgId"),
		req.user!.id,
		req.body,
	);
	res.status(201).json({ ok: true, data: event });
}

export async function getBySlug(req: Request, res: Response) {
	const event = await eventService.getEventBySlug(param(req, "slug"));
	res.json({ ok: true, data: event });
}

export async function list(req: Request, res: Response) {
	const query = (req as Request & { validatedQuery: unknown }).validatedQuery;
	const result = await eventService.listEvents(
		query as Parameters<typeof eventService.listEvents>[0],
	);
	res.json({ ok: true, ...result });
}

export async function listByOrg(req: Request, res: Response) {
	const events = await eventService.listOrgEvents(param(req, "orgId"));
	res.json({ ok: true, data: events });
}

export async function update(req: Request, res: Response) {
	const event = await eventService.updateEvent(
		param(req, "eventId"),
		req.user!.id,
		req.body,
	);
	res.json({ ok: true, data: event });
}

export async function remove(req: Request, res: Response) {
	await eventService.deleteEvent(param(req, "eventId"), req.user!.id);
	res.json({ ok: true });
}
