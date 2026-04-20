import {
	confirmFreeOrderSchema,
	idParamSchema,
	initiatePaymentSchema,
	paymentFilterSchema,
	razorpayWebhookSchema,
	refundPaymentSchema,
	updatePaymentSchema,
	verifyPaymentSchema,
} from "@voltaze/schema";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "@/common/types/auth-request";

import { paymentsService } from "./payments.service";

export class PaymentsController {
	private getActor(req: Request) {
		const authReq = req as AuthenticatedRequest;
		return {
			userId: authReq.auth.userId,
			role: authReq.auth.role,
		};
	}

	async list(req: Request, res: Response) {
		const query = paymentFilterSchema.parse(req.query);
		const payments = await paymentsService.list(query, this.getActor(req));
		res.status(200).json(payments);
	}

	async getById(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const payment = await paymentsService.getById(
			params.id,
			this.getActor(req),
		);
		res.status(200).json(payment);
	}

	async initiate(req: Request, res: Response) {
		const body = initiatePaymentSchema.parse(req.body);
		const result = await paymentsService.create(body, this.getActor(req));
		res.status(201).json(result);
	}

	async confirmFreeOrder(req: Request, res: Response) {
		const body = confirmFreeOrderSchema.parse(req.body);
		const result = await paymentsService.confirmFreeOrder(
			body,
			this.getActor(req),
		);
		res.status(201).json(result);
	}

	async verify(req: Request, res: Response) {
		const body = verifyPaymentSchema.parse(req.body);
		const result = await paymentsService.verify(body, this.getActor(req));
		res.status(200).json(result);
	}

	async refund(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = refundPaymentSchema.parse(req.body);
		const result = await paymentsService.refund(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(result);
	}

	async update(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		const body = updatePaymentSchema.parse(req.body);
		const payment = await paymentsService.update(
			params.id,
			body,
			this.getActor(req),
		);
		res.status(200).json(payment);
	}

	async delete(req: Request, res: Response) {
		const params = idParamSchema.parse(req.params);
		await paymentsService.delete(params.id, this.getActor(req));
		res.status(204).send();
	}

	async webhook(req: Request, res: Response) {
		const body = razorpayWebhookSchema.parse(req.body);
		const payment = await paymentsService.handleWebhook(body);
		res.status(200).json(payment);
	}
}

export const paymentsController = new PaymentsController();
