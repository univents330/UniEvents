import { prisma } from "@unievent/db";
import {
	guestCheckoutSchema,
	guestVerifyPaymentSchema,
} from "@unievent/schema";
import type { Request, Response } from "express";
import { NotFoundError } from "@/common/exceptions/app-error";

import { guestCheckoutService } from "./guest-checkout.service";

export class GuestCheckoutController {
	async initiate(req: Request, res: Response) {
		const body = guestCheckoutSchema.parse(req.body);
		const result = await guestCheckoutService.initiateGuestCheckout(body);
		res.status(201).json(result);
	}

	async verify(req: Request, res: Response) {
		const body = guestVerifyPaymentSchema.parse(req.body);
		const result = await guestCheckoutService.verifyGuestPayment(body);
		res.status(200).json(result);
	}

	async getPayment(req: Request, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : "";

		const payment = await prisma.payment.findUnique({
			where: { id },
			include: {
				order: {
					include: {
						event: {
							select: {
								id: true,
								name: true,
								startDate: true,
								timezone: true,
							},
						},
						attendee: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						tickets: {
							select: {
								id: true,
								tier: {
									select: {
										id: true,
										name: true,
									},
								},
								pass: {
									select: {
										id: true,
										code: true,
										status: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		res.status(200).json(payment);
	}
}

export const guestCheckoutController = new GuestCheckoutController();
