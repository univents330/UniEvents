import { analyticsFilterSchema, idParamSchema } from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { analyticsService } from "./analytics.service";

export class AnalyticsController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
		};
	}

	async getEventAnalytics(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const result = await analyticsService.getEventAnalytics(
			params.id,
			this.getActor(req),
		);
		res.status(200).json(result);
	}

	async getRevenueAnalytics(req: Request, res: Response) {
		const query = analyticsFilterSchema.parse(req.query);
		const result = await analyticsService.getRevenueAnalytics(
			query,
			this.getActor(req),
		);
		res.status(200).json(result);
	}

	async getAttendeeAnalytics(req: Request, res: Response) {
		const query = analyticsFilterSchema.parse(req.query);
		const result = await analyticsService.getAttendeeAnalytics(
			query,
			this.getActor(req),
		);
		res.status(200).json(result);
	}
}

export const analyticsController = new AnalyticsController();
