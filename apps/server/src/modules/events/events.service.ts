import { prisma, type UserRole } from "@voltaze/db";
import type {
	CreateEventInput,
	EventFilterInput,
	UpdateEventInput,
} from "@voltaze/schema";

import { ForbiddenError, NotFoundError } from "@/common/exceptions/app-error";

export class EventsService {
	async list(input: EventFilterInput) {
		const { page, limit, sortBy, sortOrder, search, ...filters } = input;
		const skip = (page - 1) * limit;

		return prisma.event.findMany({
			where: {
				...filters,
				name: search
					? {
							contains: search,
							mode: "insensitive",
						}
					: undefined,
			},
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});
	}

	async getById(id: string) {
		const event = await prisma.event.findUnique({ where: { id } });
		if (!event) {
			throw new NotFoundError("Event not found");
		}
		return event;
	}

	async create(input: CreateEventInput, hostUserId: string) {
		const slug = input.name.toLowerCase().trim().replaceAll(/\s+/g, "-");
		return prisma.event.create({
			data: {
				...input,
				userId: hostUserId,
				slug: `${slug}-${Date.now()}`,
			},
		});
	}

	async update(
		id: string,
		input: UpdateEventInput,
		actor: { userId: string; role: UserRole },
	) {
		const event = await this.getById(id);

		if (actor.role !== "ADMIN") {
			if (!event.userId || event.userId !== actor.userId) {
				throw new ForbiddenError("You can only update events you host");
			}
		}

		return prisma.event.update({
			where: { id },
			data: input,
		});
	}
}

export const eventsService = new EventsService();
