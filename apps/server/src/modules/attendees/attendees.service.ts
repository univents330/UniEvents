import { prisma } from "@voltaze/db";
import type {
	AttendeeFilterInput,
	CreateAttendeeInput,
	UpdateAttendeeInput,
} from "@voltaze/schema";

import { ConflictError, NotFoundError } from "@/common/exceptions/app-error";

export class AttendeesService {
	async list(input: AttendeeFilterInput) {
		const { page, limit, sortBy, sortOrder, search, ...filters } = input;
		const skip = (page - 1) * limit;

		return prisma.attendee.findMany({
			where: {
				...filters,
				OR: search
					? [
							{ name: { contains: search, mode: "insensitive" } },
							{ email: { contains: search, mode: "insensitive" } },
						]
					: undefined,
			},
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});
	}

	async getById(id: string) {
		const attendee = await prisma.attendee.findUnique({ where: { id } });
		if (!attendee) throw new NotFoundError("Attendee not found");
		return attendee;
	}

	async create(input: CreateAttendeeInput) {
		try {
			return await prisma.attendee.create({ data: input });
		} catch {
			throw new ConflictError("Attendee already exists for this event/email");
		}
	}

	async update(id: string, input: UpdateAttendeeInput) {
		await this.getById(id);
		return prisma.attendee.update({ where: { id }, data: input });
	}
}

export const attendeesService = new AttendeesService();
