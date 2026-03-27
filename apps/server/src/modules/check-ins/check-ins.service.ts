import { prisma } from "@voltaze/db";
import type { CheckInFilterInput, CreateCheckInInput } from "@voltaze/schema";

import { BadRequestError, NotFoundError } from "@/common/exceptions/app-error";

export class CheckInsService {
	async list(input: CheckInFilterInput) {
		const { page, limit, sortBy, sortOrder, dateFrom, dateTo, ...filters } =
			input;
		const skip = (page - 1) * limit;
		return prisma.checkIn.findMany({
			where: {
				...filters,
				timestamp: {
					gte: dateFrom,
					lte: dateTo,
				},
			},
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});
	}

	async getById(id: string) {
		const checkIn = await prisma.checkIn.findUnique({ where: { id } });
		if (!checkIn) throw new NotFoundError("Check-in not found");
		return checkIn;
	}

	async create(input: CreateCheckInInput) {
		const attendee = await prisma.attendee.findUnique({
			where: { id: input.attendeeId },
		});
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (attendee.eventId !== input.eventId) {
			throw new BadRequestError("Attendee does not belong to this event");
		}
		return prisma.checkIn.create({ data: input });
	}
}

export const checkInsService = new CheckInsService();
