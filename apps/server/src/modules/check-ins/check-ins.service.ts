import { Prisma, prisma, type UserRole } from "@voltaze/db";
import {
	type CheckInFilterInput,
	type CreateCheckInInput,
	createPaginationMeta,
} from "@voltaze/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type CheckInActor = {
	userId: string;
	role: UserRole;
};

export class CheckInsService {
	private canManageAll(actor: CheckInActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: CheckInActor): Prisma.CheckInWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		if (actor.role === "HOST") {
			return {
				attendee: {
					event: {
						userId: actor.userId,
					},
				},
			};
		}

		return {
			attendee: {
				userId: actor.userId,
			},
		};
	}

	private ensureCanCreateCheckIn(
		attendee: { event: { userId: string | null } },
		actor: CheckInActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (actor.role === "USER") {
			throw new ForbiddenError("Only organizers can create check-ins");
		}

		if (!attendee.event.userId || attendee.event.userId !== actor.userId) {
			throw new ForbiddenError("You can only create check-ins for your events");
		}
	}

	private ensureCanDeleteCheckIn(actor: CheckInActor) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (actor.role === "USER") {
			throw new ForbiddenError("Users cannot delete check-ins");
		}
	}

	async list(input: CheckInFilterInput, actor: CheckInActor) {
		const { page, limit, sortBy, sortOrder, dateFrom, dateTo, ...filters } =
			input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
			timestamp:
				dateFrom || dateTo
					? {
							gte: dateFrom,
							lte: dateTo,
						}
					: undefined,
		};

		const [data, total] = await Promise.all([
			prisma.checkIn.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.checkIn.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: CheckInActor) {
		const checkIn = await prisma.checkIn.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});

		if (!checkIn) throw new NotFoundError("Check-in not found");
		return checkIn;
	}

	async create(input: CreateCheckInInput, actor: CheckInActor) {
		const attendee = await prisma.attendee.findUnique({
			where: { id: input.attendeeId },
			include: {
				event: {
					select: {
						userId: true,
					},
				},
			},
		});
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (attendee.eventId !== input.eventId) {
			throw new BadRequestError("Attendee does not belong to this event");
		}

		this.ensureCanCreateCheckIn(attendee, actor);

		const existingCheckIn = await prisma.checkIn.findFirst({
			where: {
				attendeeId: input.attendeeId,
				eventId: input.eventId,
			},
			select: {
				id: true,
			},
		});

		if (existingCheckIn) {
			throw new ConflictError("Attendee already checked in for this event");
		}

		try {
			return await prisma.checkIn.create({ data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Attendee already checked in for this event");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Check-in references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: CheckInActor) {
		this.ensureCanDeleteCheckIn(actor);

		const checkIn = await prisma.checkIn.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
			},
		});

		if (!checkIn) {
			throw new NotFoundError("Check-in not found");
		}

		await prisma.checkIn.delete({ where: { id: checkIn.id } });
	}
}

export const checkInsService = new CheckInsService();
