import type { Request, Response } from "express";
import * as communityService from "../services/community.service";

function param(req: Request, key: string): string {
	const val = req.params[key];
	return Array.isArray(val) ? val[0]! : val!;
}

export async function create(req: Request, res: Response) {
	const community = await communityService.createCommunity(
		param(req, "orgId"),
		req.body,
	);
	res.status(201).json({ ok: true, data: community });
}

export async function getById(req: Request, res: Response) {
	const community = await communityService.getCommunity(
		param(req, "communityId"),
	);
	res.json({ ok: true, data: community });
}

export async function update(req: Request, res: Response) {
	const community = await communityService.updateCommunity(
		param(req, "communityId"),
		req.body,
	);
	res.json({ ok: true, data: community });
}

export async function join(req: Request, res: Response) {
	const member = await communityService.joinCommunity(
		param(req, "communityId"),
		req.user!.id,
	);
	res.status(201).json({ ok: true, data: member });
}

export async function createInvite(req: Request, res: Response) {
	const invite = await communityService.createInvite(
		param(req, "eventId"),
		req.body,
	);
	res.status(201).json({ ok: true, data: invite });
}

export async function listInvites(req: Request, res: Response) {
	const invites = await communityService.listInvites(param(req, "eventId"));
	res.json({ ok: true, data: invites });
}

export async function joinWaitlist(req: Request, res: Response) {
	const entry = await communityService.joinWaitlist(
		param(req, "eventId"),
		req.user?.id,
		req.body,
	);
	res.status(201).json({ ok: true, data: entry });
}

export async function listWaitlist(req: Request, res: Response) {
	const list = await communityService.listWaitlist(param(req, "eventId"));
	res.json({ ok: true, data: list });
}
