import { prisma } from "@voltaze/db";
import type {
	CreateOrderInput,
	OrderFilterInput,
	UpdateOrderInput,
} from "@voltaze/schema";

import { BadRequestError, NotFoundError } from "@/common/exceptions/app-error";

export class OrdersService {
	async list(input: OrderFilterInput) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;
		return prisma.order.findMany({
			where: { ...filters, deletedAt: null },
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});
	}

	async getById(id: string) {
		const order = await prisma.order.findUnique({ where: { id } });
		if (!order || order.deletedAt) throw new NotFoundError("Order not found");
		return order;
	}

	async create(input: CreateOrderInput) {
		const attendee = await prisma.attendee.findUnique({
			where: { id: input.attendeeId },
		});
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (attendee.eventId !== input.eventId) {
			throw new BadRequestError("Attendee does not belong to event");
		}

		const event = await prisma.event.findUnique({
			where: { id: input.eventId },
		});
		if (!event) throw new NotFoundError("Event not found");

		return prisma.order.create({ data: input });
	}

	async update(id: string, input: UpdateOrderInput) {
		await this.getById(id);
		return prisma.order.update({ where: { id }, data: input });
	}
}

export const ordersService = new OrdersService();
