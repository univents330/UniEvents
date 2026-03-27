import {
	createUserSchema,
	idParamSchema,
	updateUserSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { authService } from "./auth.service";

export class AuthController {
	async listUsers(_req: Request, res: Response) {
		const users = await authService.listUsers();
		res.status(200).json(users);
	}

	async getUserById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const user = await authService.getUserById(params.id);
		res.status(200).json(user);
	}

	async createUser(req: Request, res: Response) {
		const body = createUserSchema.parse(req.body);
		const user = await authService.createUser(body);
		res.status(201).json(user);
	}

	async updateUser(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateUserSchema.parse(req.body);
		const user = await authService.updateUser(params.id, body);
		res.status(200).json(user);
	}
}

export const authController = new AuthController();
