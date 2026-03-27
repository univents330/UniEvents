import {
	checkInFilterSchema,
	createCheckInSchema,
	idParamSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { checkInsService } from "./check-ins.service";

export class CheckInsController {
	async list(req: Request, res: Response) {
		const query = checkInFilterSchema.parse(req.query);
		const checkIns = await checkInsService.list(query);
		res.status(200).json(checkIns);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const checkIn = await checkInsService.getById(params.id);
		res.status(200).json(checkIn);
	}

	async create(req: Request, res: Response) {
		const body = createCheckInSchema.parse(req.body);
		const checkIn = await checkInsService.create(body);
		res.status(201).json(checkIn);
	}
}

export const checkInsController = new CheckInsController();
