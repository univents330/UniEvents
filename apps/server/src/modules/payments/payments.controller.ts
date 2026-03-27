import {
	createPaymentSchema,
	idParamSchema,
	razorpayWebhookSchema,
	updatePaymentSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import { paymentsService } from "./payments.service";

export class PaymentsController {
	async list(_req: Request, res: Response) {
		const payments = await paymentsService.list();
		res.status(200).json(payments);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const payment = await paymentsService.getById(params.id);
		res.status(200).json(payment);
	}

	async create(req: Request, res: Response) {
		const body = createPaymentSchema.parse(req.body);
		const payment = await paymentsService.create(body);
		res.status(201).json(payment);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updatePaymentSchema.parse(req.body);
		const payment = await paymentsService.update(params.id, body);
		res.status(200).json(payment);
	}

	async webhook(req: Request, res: Response) {
		const body = razorpayWebhookSchema.parse(req.body);
		const payment = await paymentsService.handleWebhook(body);
		res.status(200).json(payment);
	}
}

export const paymentsController = new PaymentsController();
