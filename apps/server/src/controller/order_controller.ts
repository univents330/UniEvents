import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";

const db = prisma as any;

const createOrderSchema = z.object({
	attendeeId: z.string(),
	eventId: z.string(),
	status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});

const updateOrderSchema = z.object({
	status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});

export const createOrder = async (req: Request, res: Response) => {
	try {
		const validation = createOrderSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const order = await db.order.create({
			data: validation.data,
			include: {
				attendee: true,
				event: true,
				tickets: true,
				payment: true,
			},
		});

		res.status(201).json(order);
	} catch (error) {
		res.status(500).json({
			message: "Error creating order",
			error,
		});
	}
};

export const getOrder = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const order = await db.order.findUnique({
			where: { id },
			include: {
				attendee: true,
				event: true,
				tickets: true,
				payment: true,
			},
		});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.json(order);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching order",
			error,
		});
	}
};

export const getOrdersByEvent = async (req: Request, res: Response) => {
	const eventId = req.params.eventId as string;
	try {
		const orders = await db.order.findMany({
			where: { eventId },
			include: {
				attendee: true,
				tickets: true,
				payment: true,
			},
			orderBy: { createdAt: "desc" },
		});
		res.json(orders);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching orders",
			error,
		});
	}
};

export const updateOrder = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const validation = updateOrderSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const order = await db.order.update({
			where: { id },
			data: validation.data,
		});

		res.json(order);
	} catch (error) {
		res.status(500).json({
			message: "Error updating order",
			error,
		});
	}
};
