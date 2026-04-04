import { Prisma, prisma, type UserRole } from "@voltaze/db";
import {
	type CreateTicketInput,
	createPaginationMeta,
	type TicketFilterInput,
	type UpdateTicketInput,
} from "@voltaze/schema";

import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type TicketActor = {
	userId: string;
	role: UserRole;
};

export class TicketsService {
	private canManageAll(actor: TicketActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: TicketActor): Prisma.TicketWhereInput {
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
			order: {
				attendee: {
					userId: actor.userId,
				},
			},
		};
	}

	private ensureCanUseOrder(
		order: {
			attendee: { userId: string | null };
			event: { userId: string | null };
		},
		actor: TicketActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (actor.role === "HOST") {
			if (!order.event.userId || order.event.userId !== actor.userId) {
				throw new ForbiddenError("You can only manage tickets for your events");
			}

			return;
		}

		if (!order.attendee.userId || order.attendee.userId !== actor.userId) {
			throw new ForbiddenError("You can only manage your own tickets");
		}
	}

	private ensureCanReassignTicket(ticket: {
		pass: { id: string } | null;
		order: { status: "PENDING" | "COMPLETED" | "CANCELLED" };
	}) {
		if (ticket.pass) {
			throw new BadRequestError(
				"Cannot reassign ticket after a pass has been issued",
			);
		}

		if (ticket.order.status === "COMPLETED") {
			throw new BadRequestError(
				"Tickets linked to completed orders cannot be reassigned",
			);
		}
	}

	private ensurePaidTierHasSettledPayment(
		order: {
			status: "PENDING" | "COMPLETED" | "CANCELLED";
			payment: {
				status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
				deletedAt: Date | null;
			} | null;
		},
		tierPrice: number,
	) {
		if (tierPrice <= 0) {
			return;
		}

		if (order.status !== "COMPLETED") {
			throw new BadRequestError(
				"Cannot issue paid tickets until the order is completed",
			);
		}

		if (
			!order.payment ||
			order.payment.deletedAt !== null ||
			order.payment.status !== "SUCCESS"
		) {
			throw new BadRequestError(
				"Cannot issue paid tickets without a successful payment",
			);
		}
	}

	private ensureCanDeleteTicket(ticket: {
		pass: { id: string } | null;
		order: { status: "PENDING" | "COMPLETED" | "CANCELLED" };
		tier: { soldCount: number };
	}) {
		if (ticket.pass) {
			throw new BadRequestError("Cannot delete ticket with an issued pass");
		}

		if (ticket.order.status === "COMPLETED") {
			throw new BadRequestError(
				"Tickets linked to completed orders cannot be deleted",
			);
		}

		if (ticket.tier.soldCount < 1) {
			throw new BadRequestError(
				"Ticket tier inventory is inconsistent for this ticket",
			);
		}
	}

	async list(input: TicketFilterInput, actor: TicketActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.ticket.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.ticket.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: TicketActor) {
		const ticket = await prisma.ticket.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});

		if (!ticket) throw new NotFoundError("Ticket not found");
		return ticket;
	}

	async create(input: CreateTicketInput, actor: TicketActor) {
		const [order, event, tier] = await Promise.all([
			prisma.order.findUnique({
				where: { id: input.orderId },
				include: {
					attendee: {
						select: {
							userId: true,
						},
					},
					event: {
						select: {
							userId: true,
						},
					},
					payment: {
						select: {
							status: true,
							deletedAt: true,
						},
					},
				},
			}),
			prisma.event.findUnique({ where: { id: input.eventId } }),
			prisma.ticketTier.findUnique({ where: { id: input.tierId } }),
		]);
		if (!order) throw new NotFoundError("Order not found");
		if (!event) throw new NotFoundError("Event not found");
		if (!tier) throw new NotFoundError("Ticket tier not found");
		if (order.deletedAt) {
			throw new BadRequestError("Order is no longer active");
		}
		if (order.eventId !== input.eventId) {
			throw new BadRequestError("Order does not belong to event");
		}
		if (order.status === "CANCELLED") {
			throw new BadRequestError("Cannot issue ticket for cancelled order");
		}
		if (tier.eventId !== input.eventId) {
			throw new BadRequestError("Ticket tier does not belong to event");
		}

		this.ensureCanUseOrder(order, actor);
		this.ensurePaidTierHasSettledPayment(order, tier.price);

		if (tier.soldCount >= tier.maxQuantity) {
			throw new BadRequestError("Ticket tier sold out");
		}

		try {
			return await prisma.$transaction(async (tx) => {
				const ticket = await tx.ticket.create({
					data: {
						...input,
						pricePaid: tier.price,
					},
				});
				await tx.ticketTier.update({
					where: { id: input.tierId },
					data: { soldCount: { increment: 1 } },
				});
				return ticket;
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Ticket references invalid relations");
				}
			}

			throw error;
		}
	}

	async update(id: string, input: UpdateTicketInput, actor: TicketActor) {
		const ticket = await prisma.ticket.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				orderId: true,
				eventId: true,
				tierId: true,
				pass: {
					select: {
						id: true,
					},
				},
				order: {
					select: {
						status: true,
					},
				},
			},
		});

		if (!ticket) {
			throw new NotFoundError("Ticket not found");
		}

		if (
			actor.role === "USER" &&
			(input.orderId !== undefined ||
				input.eventId !== undefined ||
				input.tierId !== undefined)
		) {
			throw new BadRequestError("Users cannot reassign tickets");
		}

		const nextOrderId = input.orderId ?? ticket.orderId;
		const nextEventId = input.eventId ?? ticket.eventId;
		const nextTierId = input.tierId ?? ticket.tierId;

		const relationChanged =
			nextOrderId !== ticket.orderId ||
			nextEventId !== ticket.eventId ||
			nextTierId !== ticket.tierId;

		if (!relationChanged) {
			return prisma.ticket.update({ where: { id }, data: input });
		}

		this.ensureCanReassignTicket(ticket);

		const [order, event, tier] = await Promise.all([
			prisma.order.findUnique({
				where: { id: nextOrderId },
				include: {
					attendee: {
						select: {
							userId: true,
						},
					},
					event: {
						select: {
							userId: true,
						},
					},
					payment: {
						select: {
							status: true,
							deletedAt: true,
						},
					},
				},
			}),
			prisma.event.findUnique({ where: { id: nextEventId } }),
			prisma.ticketTier.findUnique({ where: { id: nextTierId } }),
		]);

		if (!order) throw new NotFoundError("Order not found");
		if (!event) throw new NotFoundError("Event not found");
		if (!tier) throw new NotFoundError("Ticket tier not found");
		if (order.deletedAt) {
			throw new BadRequestError("Order is no longer active");
		}
		if (order.status === "CANCELLED") {
			throw new BadRequestError("Cannot assign ticket to cancelled order");
		}
		if (order.eventId !== nextEventId) {
			throw new BadRequestError("Order does not belong to event");
		}
		if (tier.eventId !== nextEventId) {
			throw new BadRequestError("Ticket tier does not belong to event");
		}

		this.ensureCanUseOrder(order, actor);
		this.ensurePaidTierHasSettledPayment(order, tier.price);

		if (nextTierId === ticket.tierId) {
			return prisma.ticket.update({ where: { id }, data: input });
		}

		if (tier.soldCount >= tier.maxQuantity) {
			throw new BadRequestError("Ticket tier sold out");
		}

		try {
			return await prisma.$transaction(async (tx) => {
				const decrementedTier = await tx.ticketTier.updateMany({
					where: {
						id: ticket.tierId,
						soldCount: {
							gt: 0,
						},
					},
					data: { soldCount: { decrement: 1 } },
				});

				if (decrementedTier.count === 0) {
					throw new BadRequestError(
						"Ticket tier inventory is inconsistent for this ticket",
					);
				}

				await tx.ticketTier.update({
					where: { id: nextTierId },
					data: { soldCount: { increment: 1 } },
				});

				return tx.ticket.update({
					where: { id },
					data: {
						...input,
						pricePaid: tier.price,
					},
				});
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Ticket references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: TicketActor) {
		const ticket = await prisma.ticket.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				tierId: true,
				pass: {
					select: {
						id: true,
					},
				},
				order: {
					select: {
						status: true,
					},
				},
				tier: {
					select: {
						soldCount: true,
					},
				},
			},
		});

		if (!ticket) {
			throw new NotFoundError("Ticket not found");
		}

		this.ensureCanDeleteTicket(ticket);

		await prisma.$transaction(async (tx) => {
			await tx.ticket.delete({ where: { id: ticket.id } });

			const decrementedTier = await tx.ticketTier.updateMany({
				where: {
					id: ticket.tierId,
					soldCount: {
						gt: 0,
					},
				},
				data: { soldCount: { decrement: 1 } },
			});

			if (decrementedTier.count === 0) {
				throw new BadRequestError(
					"Ticket tier inventory is inconsistent for this ticket",
				);
			}
		});
	}
}

export const ticketsService = new TicketsService();
