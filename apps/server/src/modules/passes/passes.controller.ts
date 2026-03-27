import {
	createPassSchema,
	idParamSchema,
	updatePassSchema,
	validatePassSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { passesService } from "./passes.service";

export class PassesController {
	async list(_req: Request, res: Response) {
		const passes = await passesService.list();
		res.status(200).json(passes);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const pass = await passesService.getById(params.id);
		res.status(200).json(pass);
	}

	async create(req: Request, res: Response) {
		const body = createPassSchema.parse(req.body);
		const pass = await passesService.create(body);
		res.status(201).json(pass);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updatePassSchema.parse(req.body);
		const pass = await passesService.update(params.id, body);
		res.status(200).json(pass);
	}

	async validate(req: Request, res: Response) {
		const body = validatePassSchema.parse(req.body);
		const pass = await passesService.validate(body);
		res.status(200).json(pass);
	}
}

export const passesController = new PassesController();
