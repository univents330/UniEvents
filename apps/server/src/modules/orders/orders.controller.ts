import {
	createOrderSchema,
	idParamSchema,
	orderFilterSchema,
	updateOrderSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { ordersService } from "./orders.service";

export class OrdersController {
	async list(req: Request, res: Response) {
		const query = orderFilterSchema.parse(req.query);
		const orders = await ordersService.list(query);
		res.status(200).json(orders);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const order = await ordersService.getById(params.id);
		res.status(200).json(order);
	}

	async create(req: Request, res: Response) {
		const body = createOrderSchema.parse(req.body);
		const order = await ordersService.create(body);
		res.status(201).json(order);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updateOrderSchema.parse(req.body);
		const order = await ordersService.update(params.id, body);
		res.status(200).json(order);
	}
}

export const ordersController = new OrdersController();
