import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";

const createTicketSchema = z.object({
	eventId: z.string(),
	orderId: z.string(),
	tierId: z.string(),
	pricePaid: z.coerce.number().int().nonnegative(),
});

const updateTicketSchema = createTicketSchema.partial();

// This will create the ticket
export const createTicket = async (req: Request, res: Response) => {
	try {
		const validation = createTicketSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "invalid input",
				errors: validation.error.issues,
			});
		}
		const ticket = await prisma.ticket.create({ data: validation.data });
		res.status(201).json(ticket);
	} catch (error) {
		res.status(500).json({
			message: "error creating the ticket",
			error,
		});
	}
};

// This will fetch the ticket
export const getTicket = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const ticket = await prisma.ticket.findUnique({
			where: { id },
			include: { event: true, order: true, tier: true, pass: true },
		});
		if (!ticket) {
			return res.status(404).json({
				message: "ticket not found",
			});
		}
		res.json(ticket);
	} catch (error) {
		res.status(500).json({
			message: "Error while fetching the ticket",
			error,
		});
	}
};

export const getTicketsByEvent = async (req: Request, res: Response) => {
	const eventId = req.params.eventId as string;
	try {
		const tickets = await prisma.ticket.findMany({
			where: { eventId },
			include: { event: true },
		});
		res.json(tickets);
	} catch (error) {
		res.status(500).json({
			message: "error while getting the ticket",
			error,
		});
	}
};

// This will update the ticket
export const updateTicket = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const validation = updateTicketSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Failed to update the ticket",
				errors: validation.error.issues,
			});
		}
		const ticket = await prisma.ticket.update({
			where: { id },
			data: validation.data,
		});
		res.json(ticket);
	} catch {
		res.status(500).json({
			message: "error updating the ticket",
		});
	}
};

// This will delete the ticket
export const deleteTicket = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		await prisma.ticket.delete({
			where: { id },
		});
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: "Error deleting ticket", error });
	}
};
