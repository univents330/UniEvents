import {
	createPassSchema,
	idParamSchema,
	passFilterSchema,
	updatePassSchema,
	validatePassSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { passesService } from "./passes.service";

export class PassesController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
			isHost: authReq.auth.isHost,
		};
	}

	async list(req: Request, res: Response) {
		const query = passFilterSchema.parse(req.query);
		const passes = await passesService.list(query, this.getActor(req));
		res.status(200).json(passes);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const pass = await passesService.getById(params.id, this.getActor(req));
		res.status(200).json(pass);
	}

	async create(req: Request, res: Response) {
		const body = createPassSchema.parse(req.body);
		const pass = await passesService.create(body, this.getActor(req));
		res.status(201).json(pass);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updatePassSchema.parse(req.body);
		const pass = await passesService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(pass);
	}

	async validate(req: Request, res: Response) {
		const body = validatePassSchema.parse(req.body);
		const pass = await passesService.validate(body, this.getActor(req));
		res.status(200).json(pass);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await passesService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}
}

export const passesController = new PassesController();
