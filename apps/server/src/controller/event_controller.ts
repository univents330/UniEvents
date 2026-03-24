import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";

const eventSchema = z.object({
	name: z.string(),
	timezone: z.coerce.date(),
	coverurl: z.string().url(),
	thumbnail: z.string().url(),
	venuename: z.string(),
	address: z.string(),
	latitude: z.string(),
	longitutde: z.string(),
	type: z.enum(["FREE", "PAID"]),
	mode: z.enum(["ONLINE", "OFFLINE"]),
	description: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	location: z.string(),
	price: z.number().optional(),
	visibility: z.enum(["PUBLIC", "PRIVATE"]),
	slug: z.string().optional(),
});

const slugify = (text: string) => {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-");
};

const updateEventSchema = eventSchema.partial();

export const createEvent = async (req: Request, res: Response) => {
	try {
		const validation = eventSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const data = {
			...validation.data,
			slug: validation.data.slug || slugify(validation.data.name),
		};

		const event = await prisma.event.create({
			data,
		});
		res.status(201).json(event);
	} catch (error) {
		res.status(500).json({
			message: "Error creating event",
			error,
		});
	}
};

export const getEvents = async (_req: Request, res: Response) => {
	try {
		const events = await prisma.event.findMany({
			include: {
				_count: {
					select: { tickets: true, attendees: true },
				},
			},
		});
		res.json(events);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching events",
			error,
		});
	}
};

export const getEventById = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const event = await prisma.event.findUnique({
			where: { id },
			include: {
				tickets: true,
				_count: {
					select: { attendees: true },
				},
			},
		});
		if (!event) {
			return res.status(404).json({
				message: "Event not found",
			});
		}
		res.json(event);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching event",
			error,
		});
	}
};

export const getEventBySlug = async (req: Request, res: Response) => {
	const slug = req.params.slug as string;
	try {
		const event = await prisma.event.findUnique({
			where: { slug },
			include: {
				tickets: true,
				_count: {
					select: { attendees: true },
				},
			},
		});
		if (!event) {
			return res.status(404).json({
				message: "Event not found",
			});
		}
		res.json(event);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching event by slug",
			error,
		});
	}
};

export const updateEvent = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const validation = updateEventSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const event = await prisma.event.update({
			where: { id },
			data: validation.data,
		});
		res.json(event);
	} catch (error) {
		res.status(500).json({
			message: "Error updating event",
			error,
		});
	}
};

export const deleteEvent = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		await prisma.event.delete({
			where: { id },
		});
		res.status(204).send();
	} catch (error) {
		res.status(500).json({
			message: "Error deleting event",
			error,
		});
	}
};
