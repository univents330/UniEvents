import { randomUUID } from "node:crypto";
import { prisma } from "@voltaze/db";
import type {
	CreatePassInput,
	UpdatePassInput,
	ValidatePassInput,
} from "@voltaze/schema";

import { BadRequestError, NotFoundError } from "@/common/exceptions/app-error";

export class PassesService {
	async list() {
		return prisma.pass.findMany({ orderBy: { createdAt: "desc" } });
	}

	async getById(id: string) {
		const pass = await prisma.pass.findUnique({ where: { id } });
		if (!pass) throw new NotFoundError("Pass not found");
		return pass;
	}

	async create(input: CreatePassInput) {
		const [event, attendee, ticket] = await Promise.all([
			prisma.event.findUnique({ where: { id: input.eventId } }),
			prisma.attendee.findUnique({ where: { id: input.attendeeId } }),
			prisma.ticket.findUnique({ where: { id: input.ticketId } }),
		]);
		if (!event) throw new NotFoundError("Event not found");
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (!ticket) throw new NotFoundError("Ticket not found");
		if (
			attendee.eventId !== input.eventId ||
			ticket.eventId !== input.eventId
		) {
			throw new BadRequestError("Pass references invalid event relation");
		}

		return prisma.pass.create({
			data: {
				...input,
				code: `pass_${randomUUID()}`,
			},
		});
	}

	async update(id: string, input: UpdatePassInput) {
		await this.getById(id);
		return prisma.pass.update({ where: { id }, data: input });
	}

	async validate(input: ValidatePassInput) {
		const pass = await prisma.pass.findFirst({
			where: { code: input.code, eventId: input.eventId },
		});
		if (!pass) throw new NotFoundError("Pass not found");
		if (pass.status !== "ACTIVE")
			throw new BadRequestError("Pass is not active");
		return pass;
	}
}

export const passesService = new PassesService();
