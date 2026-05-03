import { Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CreateOrderInput,
	createPaginationMeta,
	type OrderFilterInput,
	type UpdateOrderInput,
} from "@unievent/schema";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import QRCode from "qrcode";

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
	isHost: boolean;
};

// Actor for guest access (when user is not logged in but has email from context)
type GuestOrderActor = {
	userId?: string;
	email?: string;
	role?: UserRole;
	isHost?: boolean;
};

export class OrdersService {
	private canManageAll(actor: OrderActor | GuestOrderActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(
		actor: OrderActor | GuestOrderActor,
	): Prisma.OrderWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		if (actor.isHost) {
			return {
				event: {
					userId: actor.userId,
				},
			};
		}

		// Allow access by userId (authenticated) or email (guest/linked)
		const orConditions: Prisma.AttendeeWhereInput[] = [];
		if (actor.userId) {
			orConditions.push({ userId: actor.userId });
		}
		if (actor.email) {
			orConditions.push({ email: actor.email });
		}

		return {
			attendee: {
				OR: orConditions,
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
		if (actor.isHost) {
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
		if (actor.role === "ADMIN" || actor.isHost) {
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
		payment: { status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" } | null;
		_count: { tickets: number };
	}) {
		if (order._count.tickets > 0) {
			throw new BadRequestError(
				"Cannot reassign orders that already have issued tickets",
			);
		}

		if (order.payment && order.payment.status === "SUCCESS") {
			throw new BadRequestError(
				"Cannot reassign orders that already have payment records",
			);
		}
	}

	private ensureCanDeleteOrder(order: {
		status: "PENDING" | "COMPLETED" | "CANCELLED";
		payment: {
			status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
		} | null;
		_count: { tickets: number };
	}) {
		if (order.status === "COMPLETED") {
			throw new BadRequestError("Completed orders cannot be deleted");
		}

		if (
			order.payment &&
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
				...this.buildAccessWhere(actor),
			},
		});
		if (!order) throw new NotFoundError("Order not found");
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
			return await prisma.order.create({
				data: {
					...input,
					totalAmount: input.totalAmount ?? 0,
				},
			});
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
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				eventId: true,
				attendeeId: true,
				status: true,
				payment: {
					select: {
						status: true,
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
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				status: true,
				payment: {
					select: {
						id: true,
						status: true,
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

		await prisma.$transaction(async (tx) => {
			await tx.order.delete({
				where: { id: order.id },
			});

			if (order.payment) {
				await tx.payment.delete({
					where: { id: order.payment.id },
				});
			}
		});
	}

	async generateTicketPdf(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			include: {
				attendee: true,
				event: true,
				tickets: {
					include: {
						tier: true,
						pass: true,
					},
				},
			},
		});

		if (!order) throw new NotFoundError("Order not found");

		const bookingDate = new Date(order.createdAt).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});

		const eventStartDate = order.event?.startDate
			? new Date(order.event.startDate).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
				})
			: "";

		const eventEndDate = order.event?.endDate
			? new Date(order.event.endDate).toLocaleDateString("en-US", {
					day: "numeric",
					year: "numeric",
				})
			: "";

		const eventStartTime = order.event?.startDate
			? new Intl.DateTimeFormat("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}).format(new Date(order.event.startDate))
			: "";

		const eventEndTime = order.event?.endDate
			? new Intl.DateTimeFormat("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}).format(new Date(order.event.endDate))
			: "";

		const eventDateStr =
			eventStartDate && eventEndDate
				? `${eventStartDate} to ${eventEndDate}`
				: eventStartDate || "";

		const eventTimeStr =
			eventStartTime && eventEndTime
				? `(${eventStartTime} to ${eventEndTime} IST)`
				: eventStartTime
					? `(${eventStartTime} IST)`
					: "";

		const tickets = await Promise.all(
			order.tickets.map(async (ticket) => {
				const qrCode = ticket.pass?.code
					? await QRCode.toDataURL(ticket.pass.code, {
							margin: 0,
							width: 400,
						})
					: null;

				return {
					...ticket,
					qrCode,
					tierName: ticket.tier?.name || "Standard",
				};
			}),
		);

		const templateSource = `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
            .ticket {
              width: 657px;
              height: 557px;
              padding: 40px;
              font-family: 'Inter', sans-serif;
              background: white;
              color: #000;
              position: relative;
              box-sizing: border-box;
              overflow: hidden;
              border: 1px solid #f1f5f9;
              page-break-after: always;
            }
            .top-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
            .details-grid { display: flex; flex-direction: column; gap: 16px; }
            .footer { position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; }
            .powered-by { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 12px; padding: 0 100px; }
            .line { height: 1px; background: #e2e8f0; flex-grow: 1; }
          </style>
        </head>
        <body>
          {{#each tickets}}
            <div class="ticket">
              <div class="top-section">
                <div style="line-height: 1.6;">
                  <p style="margin: 0; font-size: 16px; font-weight: 500; color: #64748b;">Booking Date: <span style="color: #000;">{{../bookingDate}}</span></p>
                  <p style="margin: 0; font-size: 16px; font-weight: 500; color: #64748b;">Booking ID: <span style="color: #000; font-family: monospace;">{{../shortOrderId}}</span></p>
                </div>
                {{#if qrCode}}
                  <div style="width: 140px; height: 140px; background: white;">
                    <img src="{{qrCode}}" style="width: 100%; height: 100%; object-fit: contain;" />
                  </div>
                {{/if}}
              </div>

              <div style="margin-bottom: 50px;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.025em;">Attendee Details</h2>
                <p style="margin: 0; font-size: 18px; color: #000; font-weight: 500;">{{../attendeeName}}</p>
              </div>

              <div class="details-grid">
                <div style="display: flex; align-items: flex-start;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; width: 160px; color: #64748b; text-transform: uppercase;">Event Name:</p>
                  <p style="margin: 0; font-size: 16px; color: #000; font-weight: 600;">{{../eventName}}</p>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; width: 160px; color: #64748b; text-transform: uppercase;">Event Date:</p>
                  <p style="margin: 0; font-size: 16px; color: #000; font-weight: 600;">{{../eventDateStr}} {{../eventTimeStr}}</p>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; width: 160px; color: #64748b; text-transform: uppercase;">Ticket Name:</p>
                  <p style="margin: 0; font-size: 16px; color: #000; font-weight: 600;">{{tierName}}</p>
                </div>
              </div>

              <div class="footer">
                <div class="powered-by">
                  <div class="line"></div>
                  <p style="margin: 0; font-size: 12px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.1em;">Powered By</p>
                  <div class="line"></div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                  <span style="font-weight: 900; font-size: 18px; color: #000031; letter-spacing: -0.05em;">UniEvent</span>
                </div>
              </div>
            </div>
          {{/each}}
        </body>
      </html>
    `;

		const template = Handlebars.compile(templateSource);
		const html = template({
			tickets,
			bookingDate,
			shortOrderId: order.id.slice(0, 8),
			attendeeName: order.attendee.name,
			eventName: order.event.name,
			eventDateStr,
			eventTimeStr,
		});

		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });
		const pdfBuffer = await page.pdf({
			width: "657px",
			height: "557px",
			printBackground: true,
		});

		await browser.close();
		return pdfBuffer;
	}
}

export const ordersService = new OrdersService();
