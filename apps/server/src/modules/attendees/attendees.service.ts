import { Prisma, prisma, type UserRole } from "@voltaze/db";
import {
	type AttendeeFilterInput,
	type CreateAttendeeInput,
	createPaginationMeta,
	type UpdateAttendeeInput,
} from "@voltaze/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type AttendeeActor = {
	userId: string;
	role: UserRole;
};

export class AttendeesService {
	private canManageAll(actor: AttendeeActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: AttendeeActor): Prisma.AttendeeWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		if (actor.role === "HOST") {
			return {
				event: {
					userId: actor.userId,
				},
			};
		}

		return {
			userId: actor.userId,
		};
	}

	private ensureCanManageEvent(
		eventUserId: string | null,
		actor: AttendeeActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (actor.role === "USER") {
			return;
		}

		if (!eventUserId || eventUserId !== actor.userId) {
			throw new ForbiddenError(
				"You can only manage attendees for events you host",
			);
		}
	}

	private async ensureUserExists(userId: string | null | undefined) {
		if (!userId) {
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}
	}

	async list(input: AttendeeFilterInput, actor: AttendeeActor) {
		const { page, limit, sortBy, sortOrder, search, ...filters } = input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
			OR: search
				? [
						{ name: { contains: search, mode: "insensitive" } },
						{ email: { contains: search, mode: "insensitive" } },
					]
				: undefined,
		};

		const [data, total] = await Promise.all([
			prisma.attendee.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.attendee.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: AttendeeActor) {
		const attendee = await prisma.attendee.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});

		if (!attendee) throw new NotFoundError("Attendee not found");
		return attendee;
	}

	async create(input: CreateAttendeeInput, actor: AttendeeActor) {
		const event = await prisma.event.findUnique({
			where: { id: input.eventId },
			select: { id: true, userId: true },
		});
		if (!event) {
			throw new NotFoundError("Event not found");
		}

		this.ensureCanManageEvent(event.userId, actor);

		if (
			actor.role === "USER" &&
			input.userId !== undefined &&
			input.userId !== actor.userId
		) {
			throw new ForbiddenError(
				"Users can only create attendee records for themselves",
			);
		}

		const userId = actor.role === "USER" ? actor.userId : input.userId;
		await this.ensureUserExists(userId);

		const data: CreateAttendeeInput = { ...input, userId };

		try {
			return await prisma.attendee.create({ data });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError(
						"Attendee already exists for this event/email",
					);
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Attendee references invalid relations");
				}
			}

			throw error;
		}
	}

	async update(id: string, input: UpdateAttendeeInput, actor: AttendeeActor) {
		const attendee = await this.getById(id, actor);
		const nextEventId = input.eventId ?? attendee.eventId;

		if (actor.role === "USER") {
			if (input.userId !== undefined && input.userId !== actor.userId) {
				throw new ForbiddenError(
					"Users can only modify attendee records they own",
				);
			}

			if (nextEventId !== attendee.eventId) {
				throw new BadRequestError(
					"Users cannot move attendee registrations across events",
				);
			}
		}

		if (nextEventId !== attendee.eventId) {
			const nextEvent = await prisma.event.findUnique({
				where: { id: nextEventId },
				select: { id: true, userId: true },
			});
			if (!nextEvent) {
				throw new NotFoundError("Event not found");
			}

			this.ensureCanManageEvent(nextEvent.userId, actor);
		}

		if (input.userId !== undefined) {
			await this.ensureUserExists(input.userId);
		}

		try {
			return await prisma.attendee.update({ where: { id }, data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError(
						"Attendee already exists for this event/email",
					);
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Attendee references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: AttendeeActor) {
		const attendee = await prisma.attendee.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				_count: {
					select: {
						orders: true,
						passes: true,
						checkIns: true,
					},
				},
			},
		});

		if (!attendee) {
			throw new NotFoundError("Attendee not found");
		}

		if (
			attendee._count.orders > 0 ||
			attendee._count.passes > 0 ||
			attendee._count.checkIns > 0
		) {
			throw new BadRequestError(
				"Cannot delete attendee with related orders, passes, or check-ins",
			);
		}

		await prisma.attendee.delete({ where: { id: attendee.id } });
	}
}

export const attendeesService = new AttendeesService();
