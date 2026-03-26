import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth";

const eventSchema = z.object({
	name: z.string(),
	slug: z.string().optional(),
	coverUrl: z.string().url(),
	thumbnail: z.string().url(),
	venueName: z.string(),
	address: z.string(),
	latitude: z.string(),
	longitude: z.string(),
	timezone: z.coerce.date(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	type: z.enum(["FREE", "PAID"]),
	mode: z.enum(["ONLINE", "OFFLINE"]),
	visibility: z.enum(["PUBLIC", "PRIVATE"]),
	status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
	description: z.string(),
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

		const user = (req as AuthedRequest).user;
		if (!user) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const eventData = validation.data;
		const data: any = {
			...eventData,
			slug: eventData.slug || slugify(eventData.name),
			user: { connect: { id: user.id } },
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
		const whereBySlug = { slug } as unknown as Record<string, string>;
		const event = await prisma.event.findFirst({
			where: whereBySlug,
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
	const user = (req as AuthedRequest).user;
	if (!user) {
		return res.status(401).json({ message: "Authentication required" });
	}
	try {
		const existingEvent = await prisma.event.findUnique({ where: { id } });
		if (!existingEvent) {
			return res.status(404).json({ message: "Event not found" });
		}
		if (existingEvent.userId !== user.id) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this event" });
		}

		const validation = updateEventSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid input",
				errors: validation.error.issues,
			});
		}

		const updateData: any = { ...validation.data };
		if (updateData.slug && typeof updateData.slug !== "string") {
			updateData.slug = slugify(existingEvent.name);
		}

		const event = await prisma.event.update({
			where: { id },
			data: updateData,
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
	const user = (req as AuthedRequest).user;
	if (!user) {
		return res.status(401).json({ message: "Authentication required" });
	}
	try {
		const existingEvent = await prisma.event.findUnique({ where: { id } });
		if (!existingEvent) {
			return res.status(404).json({ message: "Event not found" });
		}
		if (existingEvent.userId !== user.id) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this event" });
		}

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
