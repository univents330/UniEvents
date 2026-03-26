import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";

const db = prisma as any;

const paymentStatusSchema = z.enum([
	"PENDING",
	"SUCCESS",
	"FAILED",
	"REFUNDED",
]);
const paymentGatewaySchema = z.enum(["RAZORPAY"]);

const createPaymentSchema = z.object({
	orderId: z.string(),
	amount: z.coerce.number().int().nonnegative(),
	currency: z.string().optional(),
	transactionId: z.string().optional(),
	status: paymentStatusSchema.optional(),
	gateway: paymentGatewaySchema,
	gatewayMeta: z.any().optional(),
});

const updatePaymentSchema = z.object({
	transactionId: z.string().optional(),
	status: paymentStatusSchema.optional(),
	gateway: paymentGatewaySchema.optional(),
	gatewayMeta: z.any().optional(),
	currency: z.string().optional(),
	amount: z.coerce.number().int().nonnegative().optional(),
});

export const createPayment = async (req: Request, res: Response) => {
	try {
		const validation = createPaymentSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const payment = await db.payment.create({
			data: validation.data,
			include: { order: true },
		});

		res.status(201).json(payment);
	} catch (error) {
		res.status(500).json({
			message: "Error creating payment",
			error,
		});
	}
};

export const getPayment = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const payment = await db.payment.findUnique({
			where: { id },
			include: { order: true },
		});

		if (!payment) {
			return res.status(404).json({ message: "Payment not found" });
		}

		res.json(payment);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching payment",
			error,
		});
	}
};

export const getPaymentByOrder = async (req: Request, res: Response) => {
	const orderId = req.params.orderId as string;
	try {
		const payment = await db.payment.findUnique({
			where: { orderId },
			include: { order: true },
		});

		if (!payment) {
			return res.status(404).json({ message: "Payment not found" });
		}

		res.json(payment);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching payment",
			error,
		});
	}
};

export const updatePayment = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const validation = updatePaymentSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const payment = await db.payment.update({
			where: { id },
			data: validation.data,
		});

		res.json(payment);
	} catch (error) {
		res.status(500).json({
			message: "Error updating payment",
			error,
		});
	}
};
