import {
	adminUpdateUserSchema,
	hostModeSchema,
	updateProfileSchema,
	userFilterSchema,
	userIdParamSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";
import { usersService } from "./users.service";

export class UsersController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
		};
	}

	async list(req: Request, res: Response) {
		const query = userFilterSchema.parse(req.query);
		const result = await usersService.list(query, this.getActor(req));
		res.status(200).json(result);
	}

	async getById(req: Request, res: Response) {
		const params = userIdParamSchema.parse(req.params);
		const user = await usersService.getById(params.userId);
		res.status(200).json(user);
	}

	async getHostProfile(req: Request, res: Response) {
		const params = userIdParamSchema.parse(req.params);
		const profile = await usersService.getHostProfile(params.userId);
		res.status(200).json(profile);
	}

	async getMe(req: Request, res: Response) {
		const actor = this.getActor(req);
		const user = await usersService.getById(actor.userId);
		res.status(200).json(user);
	}

	async updateMe(req: Request, res: Response) {
		const body = updateProfileSchema.parse(req.body);
		const actor = this.getActor(req);
		const user = await usersService.updateProfile(actor.userId, body);
		res.status(200).json(user);
	}

	async setHostMode(req: Request, res: Response) {
		const body = hostModeSchema.parse(req.body);
		const actor = this.getActor(req);
		const user = await usersService.setHostMode(actor.userId, body.enabled);
		res.status(200).json(user);
	}

	async adminUpdate(req: Request, res: Response) {
		const params = userIdParamSchema.parse(req.params);
		const body = adminUpdateUserSchema.parse(req.body);
		const actor = this.getActor(req);
		const user = await usersService.adminUpdate(params.userId, actor, body);
		res.status(200).json(user);
	}
}

export const usersController = new UsersController();
