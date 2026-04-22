import {
	createOrderSchema,
	idParamSchema,
	orderFilterSchema,
	updateOrderSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { ordersService } from "./orders.service";

export class OrdersController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			email: authReq.auth.email,
			role: authReq.auth.role,
		};
	}

	async list(req: Request, res: Response) {
		const query = orderFilterSchema.parse(req.query);
		const orders = await ordersService.list(query, this.getActor(req));
		res.status(200).json(orders);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const order = await ordersService.getById(params.id, this.getActor(req));
		res.status(200).json(order);
	}

	async create(req: Request, res: Response) {
		const body = createOrderSchema.parse(req.body);
		const order = await ordersService.create(body, this.getActor(req));
		res.status(201).json(order);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateOrderSchema.parse(req.body);
		const order = await ordersService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(order);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await ordersService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}
}

export const ordersController = new OrdersController();
