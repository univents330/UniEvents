import prisma from "@voltaze/db";
import type { Request, Response } from "express";
import { z } from "zod";

const createPassSchema = z.object({
	eventId: z.string(),
	attendeeId: z.string(),
	type: z.string(),
});

// create pass controller ready
export const createPass = async (req: Request, res: Response) => {
	try {
		const validation = createPassSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				message: "Invalid Input",
				errors: validation.error.issues,
			});
		}
		const pass = await prisma.pass.create({
			data: validation.data,
		});
		res.status(201).json(pass);
	} catch (error) {
		res.status(500).json({
			message: "Error creating pass",
			error,
		});
	}
};
// Get pass controller ready
export const getPass = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const pass = await prisma.pass.findUnique({
			where: { id },
			include: { event: true, attendee: true },
		});
		if (!pass) {
			return res.status(404).json({
				message: "pass not found",
			});
		}
		res.json(pass);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching pass",
			error,
		});
	}
};

export const verifyPass = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	try {
		const pass = await prisma.pass.findUnique({
			where: { id },
		});
		if (!pass) {
			return res.status(404).json({
				message: "No pass found",
			});
		}
		if (pass.status !== "ACTIVE") {
			return res.status(400).json({
				message: "Pass is invalid or already used",
			});
		}
		const [updatedPass, checkIn] = await prisma.$transaction([
			prisma.pass.update({
				where: { id },
				data: { status: "CHECKED_IN" },
			}),
			prisma.checkIn.create({
				data: {
					attendeeId: pass.attendeeId,
					method: "QR_SCAN",
				},
			}),
		]);
		res.json({ message: "Check-in successful", pass: updatedPass, checkIn });
	} catch (error) {
		return res.status(500).json({
			message: "Error verifying pass",
			error,
		});
	}
};

export const getPassesByEvent = async (req: Request, res: Response) => {
	const eventId = req.params.eventId as string;
	try {
		const passes = await prisma.pass.findMany({
			where: { eventId },
			include: { attendee: true },
		});
		res.json(passes);
	} catch (error) {
		res.status(500).json({ message: "Error fetching passes", error });
	}
};
