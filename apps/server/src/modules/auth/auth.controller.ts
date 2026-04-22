import {
	authSessionIdParamSchema,
	changePasswordSchema,
	forgotPasswordSchema,
	requestEmailVerificationSchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from "@unievent/schema";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { authService } from "./auth.service";

export class AuthController {
	private toAuthHeaders(req: Request) {
		return fromNodeHeaders(req.headers);
	}

	private applySetCookieHeaders(res: Response, headers?: Headers) {
		if (!headers) {
			return;
		}

		const getSetCookie = (
			headers as Headers & { getSetCookie?: () => string[] }
		).getSetCookie;
		const setCookies =
			typeof getSetCookie === "function"
				? getSetCookie.call(headers)
				: headers.get("set-cookie")
					? [headers.get("set-cookie") as string]
					: [];

		if (setCookies.length > 0) {
			res.setHeader("set-cookie", setCookies);
		}
	}

	async register(req: Request, res: Response) {
		const result = await authService.register(
			req.body,
			this.toAuthHeaders(req),
		);
		this.applySetCookieHeaders(res, result.headers);
		res.status(201).json(result.data);
	}

	async login(req: Request, res: Response) {
		const result = await authService.login(req.body, this.toAuthHeaders(req));
		this.applySetCookieHeaders(res, result.headers);
		res.status(200).json(result.data);
	}

	async refresh(req: Request, res: Response) {
		const result = await authService.refresh(req.body, this.toAuthHeaders(req));
		this.applySetCookieHeaders(res, result.headers);
		res.status(200).json(result.data);
	}

	async logout(req: Request, res: Response) {
		const result = await authService.logout(req.body, this.toAuthHeaders(req));
		this.applySetCookieHeaders(res, result.headers);
		res.status(204).send();
	}

	async logoutAll(req: Request, res: Response) {
		const result = await authService.logoutAll(this.toAuthHeaders(req));
		this.applySetCookieHeaders(res, result.headers);
		res.status(204).send();
	}

	async sessions(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const sessions = await authService.listSessions(
			authReq.auth.userId,
			authReq.auth.sessionId,
		);
		res.status(200).json(sessions);
	}

	async revokeSession(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const params = authSessionIdParamSchema.parse(req.params);
		await authService.revokeSession(
			authReq.auth.userId,
			params.sessionId,
			this.toAuthHeaders(req),
		);
		res.status(204).send();
	}

	async me(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const user = await authService.getCurrentUser(authReq.auth.userId);
		res.status(200).json(user);
	}

	async forgotPassword(req: Request, res: Response) {
		const body = forgotPasswordSchema.parse(req.body);
		const result = await authService.forgotPassword(body);
		res.status(200).json(result);
	}

	async resetPassword(req: Request, res: Response) {
		const body = resetPasswordSchema.parse(req.body);
		const result = await authService.resetPassword(body);
		res.status(200).json(result);
	}

	async changePassword(req: Request, res: Response) {
		const body = changePasswordSchema.parse(req.body);
		const result = await authService.changePassword(
			body,
			this.toAuthHeaders(req),
		);
		this.applySetCookieHeaders(res, result.headers);
		res.status(200).json(result.data);
	}

	async requestEmailVerification(req: Request, res: Response) {
		const authReq = req as AuthenticatedRequest;
		const body = requestEmailVerificationSchema.parse(req.body);
		const result = await authService.requestEmailVerification(
			authReq.auth.userId,
			this.toAuthHeaders(req),
			body.email,
		);
		res.status(200).json(result);
	}

	async verifyEmail(req: Request, res: Response) {
		const body = verifyEmailSchema.parse(req.body);
		const result = await authService.verifyEmail(body, this.toAuthHeaders(req));
		res.status(200).json(result);
	}
}

export const authController = new AuthController();
