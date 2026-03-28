import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { authService } from "./auth.service";

export class AuthController {
	private getRequestContext(req: Request) {
		return {
			ipAddress: req.ip,
			userAgent: req.get("user-agent") ?? null,
		};
	}

	async register(req: Request, res: Response) {
		const result = await authService.register(
			req.body,
			this.getRequestContext(req),
		);
		res.status(201).json(result);
	}

	async login(req: Request, res: Response) {
		const result = await authService.login(
			req.body,
			this.getRequestContext(req),
		);
		res.status(200).json(result);
	}

	async refresh(req: Request, res: Response) {
		const result = await authService.refresh(req.body);
		res.status(200).json(result);
	}

	async logout(req: Request, res: Response) {
		await authService.logout(req.body);
		res.status(204).send();
	}

	async me(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const user = await authService.getCurrentUser(authReq.auth.userId);
		res.status(200).json(user);
	}
}

export const authController = new AuthController();
