import { Prisma, prisma, type UserRole } from "@voltaze/db";
import {
	type CreateEventInput,
	type CreateEventTicketTierInput,
	createPaginationMeta,
	type EventFilterInput,
	type TicketTierFilterInput,
	type UpdateEventInput,
	type UpdateEventTicketTierInput,
} from "@voltaze/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";
import { eventNotificationService } from "./event-notification.service";

type EventActor = {
	userId: string;
	role: UserRole;
};

type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
type EventModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export class EventsService {
	private buildReadAccessWhere(actor?: EventActor): Prisma.EventWhereInput {
		const publicPublishedWhere: Prisma.EventWhereInput = {
			visibility: "PUBLIC",
			moderationStatus: "APPROVED",
			status: {
				in: ["PUBLISHED", "COMPLETED"],
			},
		};

		if (!actor) {
			return publicPublishedWhere;
		}

		if (actor.role === "ADMIN") {
			return {};
		}

		if (actor.role === "HOST") {
			return {
				OR: [publicPublishedWhere, { userId: actor.userId }],
			};
		}

		if (actor.role === "USER") {
			return {
				OR: [publicPublishedWhere, { userId: actor.userId }],
			};
		}

		return {
			OR: [
				publicPublishedWhere,
				{
					userId: actor.userId,
				},
				{
					attendees: {
						some: {
							userId: actor.userId,
						},
					},
				},
			],
		};
	}

	private validateEventWindow(startDate: Date, endDate: Date) {
		if (endDate < startDate) {
			throw new BadRequestError(
				"Event endDate must be greater than or equal to startDate",
			);
		}
	}

	private validateEventStatusTransition(
		currentStatus: EventStatus,
		nextStatus: EventStatus,
	) {
		if (currentStatus === "COMPLETED" && nextStatus !== "COMPLETED") {
			throw new BadRequestError("Completed events cannot be reopened");
		}

		if (currentStatus === "CANCELLED" && nextStatus !== "CANCELLED") {
			throw new BadRequestError("Cancelled events cannot be reopened");
		}
	}

	private async ensureTicketTierWindowsWithinEvent(
		eventId: string,
		startDate: Date,
		endDate: Date,
	) {
		const conflictingTicketTier = await prisma.ticketTier.findFirst({
			where: {
				eventId,
				OR: [
					{
						salesStart: {
							not: null,
							lt: startDate,
						},
					},
					{
						salesEnd: {
							not: null,
							gt: endDate,
						},
					},
				],
			},
			select: { id: true },
		});

		if (conflictingTicketTier) {
			throw new BadRequestError(
				"Event date range cannot exclude existing ticket tier sales windows",
			);
		}
	}

	private ensureCanModifyTicketTiers(eventStatus: EventStatus) {
		if (eventStatus === "CANCELLED" || eventStatus === "COMPLETED") {
			throw new BadRequestError(
				"Cannot modify ticket tiers for cancelled or completed events",
			);
		}
	}

	private validateTicketTierWindowWithinEvent(
		eventRange: { startDate: Date; endDate: Date },
		salesStart?: Date | null,
		salesEnd?: Date | null,
	) {
		this.validateSalesWindow(salesStart, salesEnd);

		if (salesStart && salesStart < eventRange.startDate) {
			throw new BadRequestError(
				"Ticket tier salesStart cannot be before event startDate",
			);
		}

		if (salesEnd && salesEnd > eventRange.endDate) {
			throw new BadRequestError(
				"Ticket tier salesEnd cannot be after event endDate",
			);
		}
	}

	async list(input: EventFilterInput, actor?: EventActor) {
		const {
			page,
			limit,
			sortBy,
			sortOrder,
			search,
			startDateFrom,
			startDateTo,
			...filters
		} = input;
		const skip = (page - 1) * limit;
		const accessWhere = this.buildReadAccessWhere(actor);
		const trimmedSearch = search?.trim();

		const where: Prisma.EventWhereInput = {
			AND: [
				accessWhere,
				{
					...filters,
					startDate:
						startDateFrom || startDateTo
							? {
									gte: startDateFrom,
									lte: startDateTo,
								}
							: undefined,
					OR: trimmedSearch
						? [
								{
									name: {
										contains: trimmedSearch,
										mode: "insensitive",
									},
								},
								{
									description: {
										contains: trimmedSearch,
										mode: "insensitive",
									},
								},
								{
									venueName: {
										contains: trimmedSearch,
										mode: "insensitive",
									},
								},
								{
									address: {
										contains: trimmedSearch,
										mode: "insensitive",
									},
								},
							]
						: undefined,
				},
			],
		};

		const [data, total] = await Promise.all([
			prisma.event.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.event.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor?: EventActor) {
		const accessWhere = this.buildReadAccessWhere(actor);
		const event = await prisma.event.findFirst({
			where: {
				AND: [{ id }, accessWhere],
			},
		});
		if (!event) {
			throw new NotFoundError("Event not found");
		}
		return event;
	}

	async getBySlug(slug: string, actor?: EventActor) {
		const accessWhere = this.buildReadAccessWhere(actor);
		const event = await prisma.event.findFirst({
			where: {
				AND: [{ slug }, accessWhere],
			},
		});
		if (!event) {
			throw new NotFoundError("Event not found");
		}
		return event;
	}

	async create(input: CreateEventInput, actor: EventActor) {
		this.validateEventWindow(input.startDate, input.endDate);
		const slug = input.name.toLowerCase().trim().replaceAll(/\s+/g, "-");
		const moderationStatus: EventModerationStatus =
			actor.role === "USER" ? "PENDING" : "APPROVED";

		try {
			return await prisma.event.create({
				data: {
					...input,
					userId: actor.userId,
					moderationStatus,
					status: "DRAFT",
					slug: `${slug}-${Date.now()}`,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Event slug already exists");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Event references invalid relations");
				}
			}

			throw error;
		}
	}

	private ensureCanManageEvent(eventUserId: string | null, actor: EventActor) {
		if (actor.role === "ADMIN") {
			return;
		}

		if (!eventUserId || eventUserId !== actor.userId) {
			throw new ForbiddenError("You can only manage events you host");
		}
	}

	private validateSalesWindow(
		salesStart?: Date | null,
		salesEnd?: Date | null,
	) {
		if (salesStart && salesEnd && salesStart > salesEnd) {
			throw new BadRequestError(
				"Ticket tier salesStart must be before or equal to salesEnd",
			);
		}
	}

	async update(id: string, input: UpdateEventInput, actor: EventActor) {
		const event = await this.getById(id, actor);
		this.ensureCanManageEvent(event.userId, actor);

		const nextStartDate = input.startDate ?? event.startDate;
		const nextEndDate = input.endDate ?? event.endDate;
		this.validateEventWindow(nextStartDate, nextEndDate);

		const nextStatus = input.status ?? event.status;
		this.validateEventStatusTransition(event.status, nextStatus);

		if (input.startDate !== undefined || input.endDate !== undefined) {
			await this.ensureTicketTierWindowsWithinEvent(
				id,
				nextStartDate,
				nextEndDate,
			);
		}

		try {
			return await prisma.event.update({
				where: { id },
				data: input,
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Event references invalid relations");
				}
			}

			throw error;
		}
	}

	async listTicketTiers(
		eventId: string,
		input: TicketTierFilterInput,
		actor?: EventActor,
	) {
		await this.getById(eventId, actor);
		const { page, limit, sortBy, sortOrder } = input;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			prisma.ticketTier.findMany({
				where: { eventId },
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.ticketTier.count({ where: { eventId } }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getTicketTierById(eventId: string, tierId: string, actor?: EventActor) {
		await this.getById(eventId, actor);

		const ticketTier = await prisma.ticketTier.findFirst({
			where: {
				id: tierId,
				eventId,
			},
		});

		if (!ticketTier) {
			throw new NotFoundError("Ticket tier not found");
		}

		return ticketTier;
	}

	async createTicketTier(
		eventId: string,
		input: CreateEventTicketTierInput,
		actor: EventActor,
	) {
		const event = await this.getById(eventId, actor);
		this.ensureCanManageEvent(event.userId, actor);
		this.ensureCanModifyTicketTiers(event.status);
		this.validateTicketTierWindowWithinEvent(
			{ startDate: event.startDate, endDate: event.endDate },
			input.salesStart,
			input.salesEnd,
		);

		try {
			return await prisma.ticketTier.create({
				data: {
					...input,
					eventId,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Ticket tier references invalid relations");
				}
			}

			throw error;
		}
	}

	async updateTicketTier(
		eventId: string,
		tierId: string,
		input: UpdateEventTicketTierInput,
		actor: EventActor,
	) {
		const event = await this.getById(eventId, actor);
		this.ensureCanManageEvent(event.userId, actor);
		this.ensureCanModifyTicketTiers(event.status);

		const ticketTier = await this.getTicketTierById(eventId, tierId, actor);
		const nextSalesStart = input.salesStart ?? ticketTier.salesStart;
		const nextSalesEnd = input.salesEnd ?? ticketTier.salesEnd;
		this.validateTicketTierWindowWithinEvent(
			{ startDate: event.startDate, endDate: event.endDate },
			nextSalesStart,
			nextSalesEnd,
		);

		if (
			input.maxQuantity !== undefined &&
			input.maxQuantity < ticketTier.soldCount
		) {
			throw new BadRequestError(
				"Ticket tier maxQuantity cannot be less than soldCount",
			);
		}

		try {
			return await prisma.ticketTier.update({
				where: { id: tierId },
				data: input,
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Ticket tier references invalid relations");
				}
			}

			throw error;
		}
	}

	async deleteTicketTier(eventId: string, tierId: string, actor: EventActor) {
		const event = await this.getById(eventId, actor);
		this.ensureCanManageEvent(event.userId, actor);
		this.ensureCanModifyTicketTiers(event.status);

		const ticketTier = await this.getTicketTierById(eventId, tierId, actor);
		if (ticketTier.soldCount > 0) {
			throw new BadRequestError(
				"Cannot delete ticket tier after tickets have been sold",
			);
		}

		const existingTickets = await prisma.ticket.count({
			where: { tierId: ticketTier.id },
		});
		if (existingTickets > 0) {
			throw new BadRequestError(
				"Cannot delete ticket tier that is linked to issued tickets",
			);
		}

		await prisma.ticketTier.delete({ where: { id: tierId } });
	}

	async delete(id: string, actor: EventActor) {
		const event = await prisma.event.findUnique({
			where: { id },
			select: {
				id: true,
				userId: true,
				_count: {
					select: {
						attendees: true,
						orders: true,
						tickets: true,
						passes: true,
					},
				},
			},
		});

		if (!event) {
			throw new NotFoundError("Event not found");
		}

		this.ensureCanManageEvent(event.userId, actor);

		const [checkInsCount, soldTicketTierCount] = await Promise.all([
			prisma.checkIn.count({ where: { eventId: event.id } }),
			prisma.ticketTier.count({
				where: {
					eventId: event.id,
					soldCount: {
						gt: 0,
					},
				},
			}),
		]);

		if (
			event._count.attendees > 0 ||
			event._count.orders > 0 ||
			event._count.tickets > 0 ||
			event._count.passes > 0 ||
			checkInsCount > 0 ||
			soldTicketTierCount > 0
		) {
			throw new BadRequestError(
				"Cannot delete event with related attendees, orders, tickets, passes, check-ins, or sold ticket tiers",
			);
		}

		await prisma.event.delete({ where: { id: event.id } });
	}

	async moderate(
		id: string,
		action: "APPROVE" | "REJECT",
		reason?: string,
		actor?: EventActor,
	) {
		if (!actor) {
			throw new ForbiddenError("Actor is required");
		}

		if (actor.role !== "ADMIN") {
			throw new ForbiddenError("Only admins can moderate events");
		}

		const event = await prisma.event.findUnique({ where: { id } });
		if (!event) {
			throw new NotFoundError("Event not found");
		}

		const moderationStatus: EventModerationStatus =
			action === "APPROVE" ? "APPROVED" : "REJECTED";
		const nextStatus: EventStatus =
			action === "APPROVE"
				? event.status === "DRAFT"
					? "PUBLISHED"
					: event.status
				: event.status;

		const updatedEvent = await prisma.event.update({
			where: { id },
			data: {
				moderationStatus,
				status: nextStatus,
			},
		});

		// Send email notification to event creator
		if (event.userId) {
			const user = await prisma.user.findUnique({
				where: { id: event.userId },
				select: { email: true, name: true },
			});

			if (user?.email) {
				await eventNotificationService
					.sendModerationDecision({
						event: { id: event.id, name: event.name },
						creator: { email: user.email, name: user.name },
						action,
						reason,
					})
					.catch((error) => {
						console.error("Failed to send event moderation email:", error);
					});
			}
		}

		return updatedEvent;
	}
}

export const eventsService = new EventsService();
