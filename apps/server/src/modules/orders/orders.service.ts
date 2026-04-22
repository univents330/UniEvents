import { Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CreateOrderInput,
	createPaginationMeta,
	type OrderFilterInput,
	type UpdateOrderInput,
} from "@unievent/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type OrderActor = {
	userId: string;
	email: string;
	role: UserRole;
};

export class OrdersService {
	private canManageAll(actor: OrderActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: OrderActor): Prisma.OrderWhereInput {
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
			attendee: {
				OR: [{ userId: actor.userId }, { email: actor.email }],
			},
		};
	}

	private ensureCanUseAttendee(
		attendee: { userId: string | null; event: { userId: string | null } },
		actor: OrderActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		// If the user is the one attending, they can always manage their own order
		if (attendee.userId === actor.userId) {
			return;
		}

		// Otherwise, if they have a role that implies management, check ownership
		if (actor.role === "HOST") {
			if (!attendee.event.userId || attendee.event.userId !== actor.userId) {
				throw new ForbiddenError("You can only manage orders for your events");
			}

			return;
		}

		// Default fallback for other users
		if (!attendee.userId || attendee.userId !== actor.userId) {
			throw new ForbiddenError("You can only manage your own orders");
		}
	}

	private ensureCanUseStatusUpdate(input: UpdateOrderInput, actor: OrderActor) {
		if (actor.role !== "USER") {
			return;
		}

		if (input.status && input.status !== "CANCELLED") {
			throw new ForbiddenError("Users can only cancel their own orders");
		}
	}

	private ensureValidStatusTransition(
		currentStatus: "PENDING" | "COMPLETED" | "CANCELLED",
		nextStatus: "PENDING" | "COMPLETED" | "CANCELLED",
	) {
		if (currentStatus === "CANCELLED" && nextStatus !== "CANCELLED") {
			throw new BadRequestError("Cancelled orders cannot be re-opened");
		}

		if (currentStatus === "COMPLETED" && nextStatus === "PENDING") {
			throw new BadRequestError("Completed orders cannot move back to pending");
		}
	}

	private ensureCanReassignOrder(order: {
		payment: { deletedAt: Date | null } | null;
		_count: { tickets: number };
	}) {
		if (order._count.tickets > 0) {
			throw new BadRequestError(
				"Cannot reassign orders that already have issued tickets",
			);
		}

		if (order.payment && order.payment.deletedAt === null) {
			throw new BadRequestError(
				"Cannot reassign orders that already have payment records",
			);
		}
	}

	private ensureCanDeleteOrder(order: {
		status: "PENDING" | "COMPLETED" | "CANCELLED";
		payment: {
			status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
			deletedAt: Date | null;
		} | null;
		_count: { tickets: number };
	}) {
		if (order.status === "COMPLETED") {
			throw new BadRequestError("Completed orders cannot be deleted");
		}

		if (
			order.payment &&
			order.payment.deletedAt === null &&
			(order.payment.status === "SUCCESS" ||
				order.payment.status === "REFUNDED")
		) {
			throw new BadRequestError("Paid orders cannot be deleted");
		}

		if (order._count.tickets > 0) {
			throw new BadRequestError("Orders with issued tickets cannot be deleted");
		}
	}

	async list(input: OrderFilterInput, actor: OrderActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			deletedAt: null,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.order.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
		});
		if (!order || order.deletedAt) throw new NotFoundError("Order not found");
		return order;
	}

	async create(input: CreateOrderInput, actor: OrderActor) {
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
			throw new BadRequestError("Attendee does not belong to event");
		}
		this.ensureCanUseAttendee(attendee, actor);

		const event = await prisma.event.findUnique({
			where: { id: input.eventId },
		});
		if (!event) throw new NotFoundError("Event not found");

		try {
			return await prisma.order.create({ data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Order already exists");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Order references invalid relations");
				}
			}

			throw error;
		}
	}

	async update(id: string, input: UpdateOrderInput, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				eventId: true,
				attendeeId: true,
				status: true,
				payment: {
					select: {
						deletedAt: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		this.ensureCanUseStatusUpdate(input, actor);
		const nextStatus = input.status ?? order.status;
		this.ensureValidStatusTransition(order.status, nextStatus);

		if (
			actor.role === "USER" &&
			(input.eventId !== undefined || input.attendeeId !== undefined)
		) {
			throw new BadRequestError("Users cannot reassign orders");
		}

		const nextEventId = input.eventId ?? order.eventId;
		const nextAttendeeId = input.attendeeId ?? order.attendeeId;

		if (nextEventId !== order.eventId || nextAttendeeId !== order.attendeeId) {
			this.ensureCanReassignOrder(order);

			const attendee = await prisma.attendee.findUnique({
				where: { id: nextAttendeeId },
				include: {
					event: {
						select: {
							userId: true,
						},
					},
				},
			});

			if (!attendee) {
				throw new NotFoundError("Attendee not found");
			}

			if (attendee.eventId !== nextEventId) {
				throw new BadRequestError("Attendee does not belong to event");
			}

			this.ensureCanUseAttendee(attendee, actor);
		}

		try {
			return await prisma.order.update({ where: { id }, data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Order references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				status: true,
				payment: {
					select: {
						id: true,
						status: true,
						deletedAt: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		this.ensureCanDeleteOrder(order);

		const deletedAt = new Date();

		await prisma.$transaction(async (tx) => {
			await tx.order.update({
				where: { id: order.id },
				data: {
					status: "CANCELLED",
					deletedAt,
				},
			});

			if (order.payment && order.payment.deletedAt === null) {
				await tx.payment.update({
					where: { id: order.payment.id },
					data: { deletedAt },
				});
			}
		});
	}
}

export const ordersService = new OrdersService();
