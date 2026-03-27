import { prisma } from "@voltaze/db";
import type {
	CreateTicketInput,
	TicketFilterInput,
	UpdateTicketInput,
} from "@voltaze/schema";

import { BadRequestError, NotFoundError } from "@/common/exceptions/app-error";

export class TicketsService {
	async list(input: TicketFilterInput) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;
		return prisma.ticket.findMany({
			where: filters,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});
	}

	async getById(id: string) {
		const ticket = await prisma.ticket.findUnique({ where: { id } });
		if (!ticket) throw new NotFoundError("Ticket not found");
		return ticket;
	}

	async create(input: CreateTicketInput) {
		const [order, event, tier] = await Promise.all([
			prisma.order.findUnique({ where: { id: input.orderId } }),
			prisma.event.findUnique({ where: { id: input.eventId } }),
			prisma.ticketTier.findUnique({ where: { id: input.tierId } }),
		]);
		if (!order) throw new NotFoundError("Order not found");
		if (!event) throw new NotFoundError("Event not found");
		if (!tier) throw new NotFoundError("Ticket tier not found");
		if (tier.eventId !== input.eventId) {
			throw new BadRequestError("Ticket tier does not belong to event");
		}
		if (tier.soldCount >= tier.maxQuantity) {
			throw new BadRequestError("Ticket tier sold out");
		}

		return prisma.$transaction(async (tx) => {
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
	}

	async update(id: string, input: UpdateTicketInput) {
		await this.getById(id);
		return prisma.ticket.update({ where: { id }, data: input });
	}
}

export const ticketsService = new TicketsService();
