import type { Request, Response } from "express";
import * as orgService from "../services/org.service";

function param(req: Request, key: string): string {
	const val = req.params[key];
	return Array.isArray(val) ? val[0]! : val!;
}

export async function create(req: Request, res: Response) {
	const org = await orgService.createOrg(req.user!.id, req.body);
	res.status(201).json({ ok: true, data: org });
}

export async function list(req: Request, res: Response) {
	const orgs = await orgService.getUserOrgs(req.user!.id);
	res.json({ ok: true, data: orgs });
}

export async function getById(req: Request, res: Response) {
	const org = await orgService.getOrgById(param(req, "orgId"));
	res.json({ ok: true, data: org });
}

export async function update(req: Request, res: Response) {
	const org = await orgService.updateOrg(
		param(req, "orgId"),
		req.user!.id,
		req.body,
	);
	res.json({ ok: true, data: org });
}

export async function remove(req: Request, res: Response) {
	await orgService.deleteOrg(param(req, "orgId"), req.user!.id);
	res.json({ ok: true });
}

export async function addMember(req: Request, res: Response) {
	const member = await orgService.addMember(
		param(req, "orgId"),
		req.user!.id,
		req.body.userId,
		req.body.role,
	);
	res.status(201).json({ ok: true, data: member });
}

export async function removeMember(req: Request, res: Response) {
	await orgService.removeMember(
		param(req, "orgId"),
		req.user!.id,
		param(req, "userId"),
	);
	res.json({ ok: true });
}
