import type { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";

function param(req: Request, key: string): string {
	const val = req.params[key];
	return Array.isArray(val) ? val[0]! : val!;
}

export async function createTier(req: Request, res: Response) {
	const tier = await ticketService.createTier(param(req, "eventId"), req.body);
	res.status(201).json({ ok: true, data: tier });
}

export async function listTiers(req: Request, res: Response) {
	const tiers = await ticketService.listTiers(param(req, "eventId"));
	res.json({ ok: true, data: tiers });
}

export async function updateTier(req: Request, res: Response) {
	const tier = await ticketService.updateTier(param(req, "tierId"), req.body);
	res.json({ ok: true, data: tier });
}

export async function deleteTier(req: Request, res: Response) {
	await ticketService.deleteTier(param(req, "tierId"));
	res.json({ ok: true });
}

export async function createPromoCode(req: Request, res: Response) {
	const promo = await ticketService.createPromoCode(
		param(req, "eventId"),
		req.body,
	);
	res.status(201).json({ ok: true, data: promo });
}

export async function listPromoCodes(req: Request, res: Response) {
	const codes = await ticketService.listPromoCodes(param(req, "eventId"));
	res.json({ ok: true, data: codes });
}

export async function purchase(req: Request, res: Response) {
	const result = await ticketService.purchaseTicket(
		param(req, "eventId"),
		req.user!.id,
		req.user!.email,
		req.body,
	);
	res.status(201).json({ ok: true, data: result });
}

export async function checkIn(req: Request, res: Response) {
	const record = await ticketService.checkIn(req.body, req.user?.id);
	res.status(201).json({ ok: true, data: record });
}
