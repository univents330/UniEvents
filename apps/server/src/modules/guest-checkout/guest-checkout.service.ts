import crypto from "node:crypto";
import { Prisma, prisma } from "@unievent/db";
import { env } from "@unievent/env/server";
import type {
	GuestCheckoutInput,
	GuestVerifyPaymentInput,
	TicketHolderInput,
} from "@unievent/schema";

import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from "@/common/exceptions/app-error";
import { sendEmailViaBrevo } from "@/common/utils/brevo";
import { logger } from "@/common/utils/logger";
import { renderOrderEmail } from "@/common/utils/mail-templates";
import {
	createRazorpayOrder,
	fetchRazorpayPayment,
	type RazorpayOrder,
	type RazorpayPayment,
} from "@/common/utils/razorpay";
import { ordersService } from "@/modules/orders/orders.service";

type CheckoutItem = { tierId: string; quantity: number };

type TicketEmailTicket = {
	id: string;
	createdAt: Date;
	tier: {
		id: string;
		name: string;
	};
	pass: {
		code: string;
	};
};

export class GuestCheckoutService {
	private normalizeCheckoutItems(items?: unknown[]): CheckoutItem[] {
		if (!items || items.length === 0) {
			return [];
		}

		const quantityByTier = new Map<string, number>();

		for (const item of items) {
			if (!item || typeof item !== "object" || Array.isArray(item)) {
				continue;
			}

			const { tierId, quantity } = item as {
				tierId?: unknown;
				quantity?: unknown;
			};

			if (typeof tierId !== "string") {
				continue;
			}

			if (
				typeof quantity !== "number" ||
				!Number.isInteger(quantity) ||
				quantity < 1
			) {
				continue;
			}

			quantityByTier.set(tierId, (quantityByTier.get(tierId) ?? 0) + quantity);
		}

		return Array.from(quantityByTier.entries()).map(([tierId, quantity]) => ({
			tierId,
			quantity,
		}));
	}

	private normalizeTicketHolders(holders?: unknown[]): TicketHolderInput[] {
		if (!holders || holders.length === 0) {
			return [];
		}

		const normalized: TicketHolderInput[] = [];

		for (const holder of holders) {
			if (!holder || typeof holder !== "object" || Array.isArray(holder)) {
				continue;
			}

			const {
				tierId,
				name,
				email,
				phone,
			}: {
				tierId?: unknown;
				name?: unknown;
				email?: unknown;
				phone?: unknown;
			} = holder;

			if (
				typeof tierId !== "string" ||
				typeof name !== "string" ||
				typeof email !== "string"
			) {
				continue;
			}

			normalized.push({
				tierId,
				name: name.trim(),
				email: email.trim().toLowerCase(),
				phone: typeof phone === "string" ? phone.trim() : null,
			});
		}

		return normalized;
	}

	private async buildCheckoutFromRequestedItems(
		eventId: string,
		checkoutItems: CheckoutItem[],
	) {
		if (checkoutItems.length === 0) {
			return { checkoutItems: [], totalAmount: 0 };
		}

		const tiers = await prisma.ticketTier.findMany({
			where: {
				id: { in: checkoutItems.map((item) => item.tierId) },
				eventId,
			},
			select: {
				id: true,
				price: true,
				quantity: true,
				soldCount: true,
			},
		});

		if (tiers.length !== checkoutItems.length) {
			throw new BadRequestError(
				"One or more ticket tiers are invalid for this event",
			);
		}

		const tierById = new Map(tiers.map((tier) => [tier.id, tier]));
		let totalAmount = 0;

		for (const item of checkoutItems) {
			const tier = tierById.get(item.tierId);
			if (!tier) {
				throw new BadRequestError("Invalid ticket tier in checkout request");
			}

			const remaining = tier.quantity - tier.soldCount;
			if (item.quantity > remaining) {
				throw new BadRequestError(
					`Requested quantity exceeds remaining inventory for tier ${tier.id}`,
				);
			}

			totalAmount += tier.price * item.quantity * 100;
		}

		return { checkoutItems, totalAmount };
	}

	private async getOrCreateGuestAttendee(
		eventId: string,
		name: string,
		email: string,
		phone?: string,
	) {
		// Try to find existing attendee by email for this event
		const existingAttendee = await prisma.attendee.findUnique({
			where: {
				eventId_email: {
					eventId,
					email: email.toLowerCase(),
				},
			},
		});

		if (existingAttendee) {
			// Update name/phone if they changed
			if (existingAttendee.name !== name || existingAttendee.phone !== phone) {
				return await prisma.attendee.update({
					where: { id: existingAttendee.id },
					data: { name, phone: phone || existingAttendee.phone },
				});
			}
			return existingAttendee;
		}

		// Create new guest attendee (userId is null for guests)
		try {
			return await prisma.attendee.create({
				data: {
					eventId,
					userId: null, // Guest checkout - no user linked
					name,
					email: email.toLowerCase(),
					phone: phone || null,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError(
						"Attendee already exists for this event/email",
					);
				}
			}
			throw error;
		}
	}

	private async createOrder(
		attendeeId: string,
		eventId: string,
		totalAmount: number,
	) {
		return await prisma.order.create({
			data: {
				attendeeId,
				eventId,
				totalAmount: totalAmount / 100, // Convert paise to rupees for storage
				status: "PENDING",
			},
		});
	}

	private async issueTicketsAndPassesForCheckout(
		tx: Prisma.TransactionClient,
		order: { id: string; eventId: string; attendeeId: string },
		checkoutItems: CheckoutItem[],
	) {
		if (checkoutItems.length === 0) {
			throw new BadRequestError("No checkout items found for ticket issuance");
		}

		const existingTicketsCount = await tx.ticket.count({
			where: {
				orderId: order.id,
			},
		});

		if (existingTicketsCount > 0) {
			return;
		}

		const tiers = await tx.ticketTier.findMany({
			where: {
				id: { in: checkoutItems.map((item) => item.tierId) },
				eventId: order.eventId,
			},
			select: {
				id: true,
				price: true,
				quantity: true,
			},
		});

		if (tiers.length !== checkoutItems.length) {
			throw new BadRequestError(
				"One or more ticket tiers are invalid for this order",
			);
		}

		const tierById = new Map(tiers.map((tier) => [tier.id, tier]));

		for (const item of checkoutItems) {
			const tier = tierById.get(item.tierId);
			if (!tier) {
				throw new BadRequestError("Invalid ticket tier in checkout payload");
			}

			const updatedTier = await tx.ticketTier.updateMany({
				where: {
					id: tier.id,
					eventId: order.eventId,
					soldCount: {
						lte: tier.quantity - item.quantity,
					},
				},
				data: {
					soldCount: {
						increment: item.quantity,
					},
				},
			});

			if (updatedTier.count === 0) {
				throw new BadRequestError("Ticket tier sold out during checkout");
			}

			for (let index = 0; index < item.quantity; index++) {
				const ticket = await tx.ticket.create({
					data: {
						orderId: order.id,
						eventId: order.eventId,
						tierId: tier.id,
						pricePaid: tier.price,
					},
				});

				await tx.pass.create({
					data: {
						eventId: order.eventId,
						attendeeId: order.attendeeId,
						ticketId: ticket.id,
						code: `pass_${crypto.randomUUID()}`,
					},
				});
			}
		}
	}

	private formatMinorAmount(amount: number, currency: string) {
		const normalizedCurrency = currency.toUpperCase();

		try {
			return new Intl.NumberFormat("en-IN", {
				style: "currency",
				currency: normalizedCurrency,
				maximumFractionDigits: 2,
			}).format(amount / 100);
		} catch {
			return `${(amount / 100).toFixed(2)} ${normalizedCurrency}`;
		}
	}

	private buildTicketEmailContent(args: {
		attendeeName: string;
		eventName: string;
		eventStartDate: Date;
		eventTimezone: string;
		orderId: string;
		amount: number;
		currency: string;
		tickets: TicketEmailTicket[];
		ticketHolders: TicketHolderInput[];
	}) {
		const {
			attendeeName,
			eventName,
			eventStartDate,
			eventTimezone,
			orderId,
			amount,
			currency,
			tickets,
			ticketHolders,
		} = args;

		const formattedAmount = this.formatMinorAmount(amount, currency);
		const formattedEventDate = new Intl.DateTimeFormat("en-IN", {
			dateStyle: "full",
			timeStyle: "short",
			timeZone: eventTimezone,
		}).format(eventStartDate);

		const buildHolderQueueByTier = () => {
			const queueMap = new Map<string, TicketHolderInput[]>();
			for (const holder of ticketHolders) {
				const queue = queueMap.get(holder.tierId) ?? [];
				queue.push(holder);
				queueMap.set(holder.tierId, queue);
			}
			return queueMap;
		};

		const holderQueue = buildHolderQueueByTier();

		const ticketsData = tickets.map((ticket) => {
			const assignedHolder = holderQueue.get(ticket.tier.id)?.shift();
			return {
				tierName: ticket.tier.name,
				passCode: ticket.pass.code,
				attendeeName: assignedHolder?.name,
				attendeeEmail: assignedHolder?.email,
			};
		});

		const dashboardUrl = `${(env.BETTER_AUTH_URL ?? env.WEB_APP_URL ?? "http://localhost:3000").replace("/auth", "")}/tickets`;

		const htmlContent = renderOrderEmail({
			attendeeName,
			eventName,
			orderId,
			amount: formattedAmount,
			eventDate: `${formattedEventDate} (${eventTimezone})`,
			tickets: ticketsData,
			dashboardUrl,
		});

		const textContent = [
			"Your UniEvent ticket is confirmed",
			`Hi ${attendeeName},`,
			`Your registration for ${eventName} is successful.`,
			`Order ID: ${orderId}`,
			`Amount Paid: ${formattedAmount}`,
			`Event Time: ${formattedEventDate} (${eventTimezone})`,
			"",
			"Your passes:",
			ticketsData
				.map(
					(t, i) =>
						`${i + 1}. Tier: ${t.tierName}, Code: ${t.passCode}${t.attendeeName ? ` (Assigned to: ${t.attendeeName})` : ""}`,
				)
				.join("\n"),
			"",
			"Note: Create an account with this email to view your tickets anytime.",
		].join("\n");

		return {
			subject: `CONFIRMED: Your ticket for ${eventName}`,
			htmlContent,
			textContent,
		};
	}

	private async sendTicketConfirmationEmail(
		paymentId: string,
		attendeeEmail: string,
	) {
		const payment = await prisma.payment.findUnique({
			where: { id: paymentId },
			select: {
				id: true,
				status: true,
				amount: true,
				currency: true,
				gatewayMeta: true,
				orderId: true,
			},
		});

		if (!payment || payment.status !== "SUCCESS") {
			return;
		}

		const gatewayMeta = payment.gatewayMeta as Record<string, unknown> | null;
		if (typeof gatewayMeta?.ticketEmailSentAt === "string") {
			return;
		}

		const order = await prisma.order.findUnique({
			where: { id: payment.orderId },
			include: {
				event: {
					select: {
						name: true,
						startDate: true,
						timezone: true,
					},
				},
				attendee: {
					select: {
						name: true,
						email: true,
					},
				},
				tickets: {
					orderBy: {
						createdAt: "asc",
					},
					select: {
						id: true,
						createdAt: true,
						tier: {
							select: {
								id: true,
								name: true,
							},
						},
						pass: {
							select: {
								code: true,
							},
						},
					},
				},
			},
		});

		if (!order) {
			return;
		}

		const ticketHolders = this.normalizeTicketHolders(
			Array.isArray(gatewayMeta?.ticketHolders)
				? (gatewayMeta.ticketHolders as unknown[])
				: undefined,
		);

		const tickets = order.tickets.filter(
			(ticket): ticket is TicketEmailTicket =>
				Boolean(ticket.pass?.code) && Boolean(ticket.tier?.name),
		);

		if (tickets.length === 0) {
			return;
		}

		const { subject, htmlContent, textContent } = this.buildTicketEmailContent({
			attendeeName: order.attendee.name,
			eventName: order.event.name,
			eventStartDate: order.event.startDate,
			eventTimezone: order.event.timezone,
			orderId: order.id,
			amount: payment.amount,
			currency: payment.currency,
			tickets,
			ticketHolders,
		});

		try {
			// Generate PDF ticket
			const pdfBuffer = await ordersService.generateTicketPdf(order.id, {
				userId: "SYSTEM_INTERNAL",
				email: "noreply@unievent.com",
				role: "ADMIN",
				isHost: false,
			});

			await sendEmailViaBrevo({
				to: attendeeEmail,
				subject,
				htmlContent,
				textContent,
				attachments: [
					{
						content: Buffer.from(pdfBuffer).toString("base64"),
						name: `UniEvent_Ticket_${order.id.slice(0, 8)}.pdf`,
					},
				],
			});

			await prisma.payment.update({
				where: { id: payment.id },
				data: {
					gatewayMeta: {
						...gatewayMeta,
						ticketEmailSentAt: new Date().toISOString(),
					} as Prisma.InputJsonValue,
				},
			});
		} catch (error) {
			logger.error(
				`Failed to send ticket confirmation email for payment ${payment.id}`,
				error,
				{ paymentId: payment.id },
			);
		}
	}

	async initiateGuestCheckout(input: GuestCheckoutInput) {
		const {
			eventId,
			items,
			purchaserName,
			purchaserEmail,
			purchaserPhone,
			ticketHolders,
		} = input;

		// Verify event exists
		const event = await prisma.event.findUnique({
			where: { id: eventId },
			select: { id: true, name: true, status: true },
		});

		if (!event) {
			throw new NotFoundError("Event not found");
		}

		if (event.status !== "PUBLISHED") {
			throw new BadRequestError("Event is not open for registration");
		}

		// Normalize checkout items
		const checkoutItems = this.normalizeCheckoutItems(items);
		if (checkoutItems.length === 0) {
			throw new BadRequestError("No valid checkout items provided");
		}

		const normalizedHolders = this.normalizeTicketHolders(ticketHolders);

		// Calculate total amount
		const { checkoutItems: validItems, totalAmount } =
			await this.buildCheckoutFromRequestedItems(eventId, checkoutItems);

		// Get or create guest attendee
		const attendee = await this.getOrCreateGuestAttendee(
			eventId,
			purchaserName,
			purchaserEmail,
			purchaserPhone,
		);

		// Create order
		const order = await this.createOrder(attendee.id, eventId, totalAmount);

		// If free event, complete immediately
		if (totalAmount === 0) {
			const payment = await prisma.$transaction(async (tx) => {
				await this.issueTicketsAndPassesForCheckout(
					tx,
					{
						id: order.id,
						eventId: order.eventId,
						attendeeId: order.attendeeId,
					},
					validItems,
				);

				const created = await tx.payment.create({
					data: {
						orderId: order.id,
						amount: 0,
						currency: "INR",
						gateway: "RAZORPAY",
						status: "SUCCESS",
						gatewayMeta: {
							freeCheckout: true,
							checkoutItems: validItems,
							ticketHolders: normalizedHolders,
							verifiedAt: new Date().toISOString(),
							guestCheckout: true,
						} as Prisma.InputJsonValue,
					},
				});

				await tx.order.update({
					where: { id: order.id },
					data: { status: "COMPLETED" },
				});

				return created;
			});

			// Send email asynchronously
			void this.sendTicketConfirmationEmail(payment.id, purchaserEmail);

			return {
				attendeeId: attendee.id,
				orderId: order.id,
				paymentId: payment.id,
				amount: 0,
				currency: "INR",
				isFree: true,
			};
		}

		// For paid orders, initiate Razorpay
		let razorpayOrder: RazorpayOrder;
		try {
			razorpayOrder = await createRazorpayOrder({
				amount: totalAmount,
				currency: "INR",
				receipt: order.id,
				notes: {
					orderId: order.id,
					eventId: eventId,
					eventName: event.name,
					attendeeEmail: purchaserEmail,
					guestCheckout: "true",
				},
			});
		} catch (_error) {
			throw new BadRequestError(
				"Unable to create a Razorpay order. Please try again later.",
			);
		}

		// Create payment record
		const payment = await prisma.payment.create({
			data: {
				orderId: order.id,
				amount: totalAmount,
				currency: "INR",
				gateway: "RAZORPAY",
				gatewayMeta: {
					razorpayOrderId: razorpayOrder.id,
					razorpayOrderStatus: razorpayOrder.status,
					checkoutItems: validItems,
					ticketHolders: normalizedHolders,
					issueTicketsOnVerify: true,
					guestCheckout: true,
				} as Prisma.InputJsonValue,
			},
		});

		return {
			attendeeId: attendee.id,
			orderId: order.id,
			paymentId: payment.id,
			razorpayOrderId: razorpayOrder.id,
			razorpayKeyId: env.RAZORPAY_KEY_ID,
			amount: totalAmount,
			currency: "INR",
			isFree: false,
			prefill: {
				name: purchaserName,
				email: purchaserEmail,
				contact: purchaserPhone,
			},
			notes: {
				orderId: order.id,
				eventName: event.name,
			},
		};
	}

	private signaturesMatch(expected: string, received: string) {
		const expectedBuffer = Buffer.from(expected, "utf8");
		const receivedBuffer = Buffer.from(received, "utf8");

		if (expectedBuffer.length !== receivedBuffer.length) {
			return false;
		}

		return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
	}

	async verifyGuestPayment(input: GuestVerifyPaymentInput) {
		const expectedSignature = crypto
			.createHmac("sha256", env.RAZORPAY_KEY_SECRET)
			.update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
			.digest("hex");

		const isSignatureValid = this.signaturesMatch(
			expectedSignature,
			input.razorpaySignature,
		);

		if (!isSignatureValid) {
			throw new BadRequestError("Invalid payment signature");
		}

		// Find payment by Razorpay order ID
		const payment = await prisma.payment.findFirst({
			where: {
				gatewayMeta: {
					path: ["razorpayOrderId"],
					equals: input.razorpayOrderId,
				},
			},
			include: {
				order: {
					include: {
						attendee: true,
					},
				},
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found for this Razorpay order");
		}

		const gatewayMeta = payment.gatewayMeta as Record<string, unknown> | null;
		const checkoutItems = this.normalizeCheckoutItems(
			Array.isArray(gatewayMeta?.checkoutItems)
				? (gatewayMeta.checkoutItems as unknown[])
				: undefined,
		);
		const issueTicketsOnVerify = gatewayMeta?.issueTicketsOnVerify === true;

		// If already verified, just return
		if (payment.status === "SUCCESS") {
			if (issueTicketsOnVerify) {
				await prisma.$transaction(async (tx) => {
					await this.issueTicketsAndPassesForCheckout(
						tx,
						{
							id: payment.order.id,
							eventId: payment.order.eventId,
							attendeeId: payment.order.attendeeId,
						},
						checkoutItems,
					);
				});
			}

			void this.sendTicketConfirmationEmail(
				payment.id,
				payment.order.attendee.email,
			);

			return {
				payment,
				orderId: payment.orderId,
				alreadyVerified: true,
			};
		}

		// Fetch Razorpay payment details
		let razorpayPayment: RazorpayPayment;
		try {
			razorpayPayment = await fetchRazorpayPayment(input.razorpayPaymentId);
		} catch {
			throw new BadRequestError(
				"Unable to fetch Razorpay payment details for verification",
			);
		}

		if (razorpayPayment.order_id !== input.razorpayOrderId) {
			throw new BadRequestError("Payment order ID mismatch");
		}

		if (razorpayPayment.amount !== payment.amount) {
			throw new BadRequestError("Payment amount mismatch");
		}

		const isCaptured =
			razorpayPayment.status === "captured" || razorpayPayment.captured;

		if (!isCaptured) {
			throw new BadRequestError(
				`Payment not captured. Current status: ${razorpayPayment.status}`,
			);
		}

		// Update payment and order, issue tickets
		const updatedPayment = await prisma.$transaction(async (tx) => {
			if (issueTicketsOnVerify) {
				await this.issueTicketsAndPassesForCheckout(
					tx,
					{
						id: payment.order.id,
						eventId: payment.order.eventId,
						attendeeId: payment.order.attendeeId,
					},
					checkoutItems,
				);
			}

			const updated = await tx.payment.update({
				where: { id: payment.id },
				data: {
					status: "SUCCESS",
					transactionId: input.razorpayPaymentId,
					gatewayMeta: {
						...gatewayMeta,
						razorpayPaymentId: input.razorpayPaymentId,
						verifiedAt: new Date().toISOString(),
					} as Prisma.InputJsonValue,
				},
			});

			await tx.order.update({
				where: { id: payment.orderId },
				data: { status: "COMPLETED" },
			});

			return updated;
		});

		// Send ticket confirmation email
		void this.sendTicketConfirmationEmail(
			updatedPayment.id,
			payment.order.attendee.email,
		);

		return {
			payment: updatedPayment,
			orderId: payment.orderId,
			alreadyVerified: false,
		};
	}
}

export const guestCheckoutService = new GuestCheckoutService();
