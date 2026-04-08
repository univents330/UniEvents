import crypto from "node:crypto";
import { Prisma, prisma, type UserRole } from "@voltaze/db";
import { env } from "@voltaze/env/server";
import {
	createPaginationMeta,
	type InitiatePaymentInput,
	type PaymentFilterInput,
	type RazorpayWebhookInput,
	type RefundPaymentInput,
	type UpdatePaymentInput,
	type VerifyPaymentInput,
} from "@voltaze/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";
import {
	createRazorpayOrder,
	createRazorpayRefund,
	fetchRazorpayPayment,
	type RazorpayOrder,
} from "@/common/utils/razorpay";

type PaymentActor = {
	userId: string;
	role: UserRole;
};

type WebhookMappedStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
type OrderSyncStatus = "PENDING" | "COMPLETED" | "CANCELLED";
type CheckoutItem = {
	tierId: string;
	quantity: number;
};

const CUID_REGEX = /^c[a-z0-9]{24}$/i;

function isCuid(value: string) {
	return CUID_REGEX.test(value);
}

function mapWebhookEventToPaymentStatus(
	event: string,
): WebhookMappedStatus | null {
	if (event === "payment.authorized") {
		return "PENDING";
	}

	if (event === "payment.captured") {
		return "SUCCESS";
	}

	if (event === "payment.failed") {
		return "FAILED";
	}

	if (event === "payment.refunded") {
		return "REFUNDED";
	}

	return null;
}

export class PaymentsService {
	private canManageAll(actor: PaymentActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: PaymentActor): Prisma.PaymentWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		if (actor.role === "HOST") {
			return {
				order: {
					event: {
						userId: actor.userId,
					},
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

	private ensureMutableFieldsUnchanged(
		input: UpdatePaymentInput,
		current: {
			orderId: string;
			amount: number;
			currency: string;
			gateway: "RAZORPAY";
		},
	) {
		if (input.orderId !== undefined && input.orderId !== current.orderId) {
			throw new BadRequestError("Payment orderId cannot be changed");
		}

		if (input.amount !== undefined && input.amount !== current.amount) {
			throw new BadRequestError("Payment amount cannot be changed");
		}

		if (
			input.currency !== undefined &&
			input.currency.toUpperCase() !== current.currency.toUpperCase()
		) {
			throw new BadRequestError("Payment currency cannot be changed");
		}

		if (input.gateway !== undefined && input.gateway !== current.gateway) {
			throw new BadRequestError("Payment gateway cannot be changed");
		}
	}

	private ensureValidStatusTransition(
		currentStatus: WebhookMappedStatus,
		nextStatus: WebhookMappedStatus,
	) {
		if (currentStatus === "REFUNDED" && nextStatus !== "REFUNDED") {
			throw new BadRequestError("Refunded payments are immutable");
		}

		if (
			currentStatus === "SUCCESS" &&
			(nextStatus === "PENDING" || nextStatus === "FAILED")
		) {
			throw new BadRequestError(
				"Successful payments can only remain successful or become refunded",
			);
		}
	}

	private async syncOrderStatusForPayment(
		tx: Prisma.TransactionClient,
		order: { id: string; status: OrderSyncStatus },
		paymentStatus: WebhookMappedStatus,
	) {
		if (paymentStatus === "SUCCESS") {
			if (order.status !== "COMPLETED") {
				await tx.order.update({
					where: { id: order.id },
					data: { status: "COMPLETED" },
				});
			}

			return;
		}

		if (paymentStatus === "REFUNDED") {
			if (order.status !== "CANCELLED") {
				await tx.order.update({
					where: { id: order.id },
					data: { status: "CANCELLED" },
				});
			}

			return;
		}

		if (paymentStatus === "FAILED" && order.status !== "COMPLETED") {
			if (order.status !== "CANCELLED") {
				await tx.order.update({
					where: { id: order.id },
					data: { status: "CANCELLED" },
				});
			}
		}
	}

	private ensureCanDeletePayment(payment: {
		status: WebhookMappedStatus;
		order: {
			status: OrderSyncStatus;
		};
	}) {
		if (payment.status === "SUCCESS" || payment.status === "REFUNDED") {
			throw new BadRequestError("Settled payments cannot be deleted");
		}

		if (payment.order.status === "COMPLETED") {
			throw new BadRequestError(
				"Payments for completed orders cannot be deleted",
			);
		}
	}

	private normalizeGatewayMeta(
		meta: Prisma.JsonValue | null,
	): Record<string, unknown> {
		if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
			return {};
		}

		return meta as Record<string, unknown>;
	}

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

	private buildCheckoutFromExistingTickets(
		tickets: Array<{ tierId: string; pricePaid: number }>,
	) {
		const quantityByTier = new Map<string, number>();
		let totalAmount = 0;

		for (const ticket of tickets) {
			quantityByTier.set(
				ticket.tierId,
				(quantityByTier.get(ticket.tierId) ?? 0) + 1,
			);
			totalAmount += ticket.pricePaid;
		}

		return {
			checkoutItems: Array.from(quantityByTier.entries()).map(
				([tierId, quantity]) => ({ tierId, quantity }),
			),
			totalAmount,
		};
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
				maxQuantity: true,
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

			const remaining = tier.maxQuantity - tier.soldCount;
			if (item.quantity > remaining) {
				throw new BadRequestError(
					`Requested quantity exceeds remaining inventory for tier ${tier.id}`,
				);
			}

			totalAmount += tier.price * item.quantity;
		}

		return { checkoutItems, totalAmount };
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
				maxQuantity: true,
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
						lte: tier.maxQuantity - item.quantity,
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
						type: "GENERAL",
						code: `pass_${crypto.randomUUID()}`,
					},
				});
			}
		}
	}

	async list(input: PaymentFilterInput, actor: PaymentActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where: Prisma.PaymentWhereInput = {
			...filters,
			deletedAt: null,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.payment.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.payment.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: PaymentActor) {
		const payment = await prisma.payment.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		return payment;
	}

	async create(input: InitiatePaymentInput, actor: PaymentActor) {
		const orderWhere: Prisma.OrderWhereInput = {
			id: input.orderId,
			deletedAt: null,
		};

		if (actor.role === "HOST") {
			orderWhere.event = {
				userId: actor.userId,
			};
		} else if (actor.role === "USER") {
			orderWhere.attendee = {
				userId: actor.userId,
			};
		}

		const order = await prisma.order.findFirst({
			where: orderWhere,
			include: {
				tickets: {
					include: {
						tier: true,
					},
				},
				event: true,
				attendee: true,
			},
		});

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.status !== "PENDING") {
			throw new BadRequestError("Can only create payments for pending orders");
		}

		const existingPayment = await prisma.payment.findFirst({
			where: {
				orderId: order.id,
				deletedAt: null,
				status: { in: ["PENDING", "SUCCESS"] },
			},
		});

		if (existingPayment) {
			throw new ConflictError(
				"A payment already exists for this order. Use verify endpoint to complete it.",
			);
		}

		const requestedCheckoutItems = this.normalizeCheckoutItems(input.items);
		if (requestedCheckoutItems.length > 0 && order.tickets.length > 0) {
			throw new BadRequestError(
				"Order already contains issued tickets. Initiate payment without checkout items.",
			);
		}

		const issueTicketsOnVerify = requestedCheckoutItems.length > 0;
		const checkoutPlan = issueTicketsOnVerify
			? await this.buildCheckoutFromRequestedItems(
					order.eventId,
					requestedCheckoutItems,
				)
			: this.buildCheckoutFromExistingTickets(order.tickets);

		const { checkoutItems, totalAmount } = checkoutPlan;

		if (totalAmount <= 0) {
			throw new BadRequestError(
				"Order total is zero. Free orders do not require payment.",
			);
		}

		let razorpayOrder: RazorpayOrder;
		try {
			razorpayOrder = await createRazorpayOrder({
				amount: totalAmount,
				currency: input.currency,
				receipt: order.id,
				notes: {
					orderId: order.id,
					eventId: order.eventId,
					eventName: order.event.name,
					attendeeEmail: order.attendee.email,
				},
			});
		} catch (_error) {
			throw new BadRequestError(
				"Unable to create a Razorpay order. Check the server Razorpay credentials in apps/server/.env.",
			);
		}

		const payment = await prisma.payment.create({
			data: {
				orderId: order.id,
				amount: totalAmount,
				currency: input.currency,
				gateway: "RAZORPAY",
				gatewayMeta: {
					razorpayOrderId: razorpayOrder.id,
					razorpayOrderStatus: razorpayOrder.status,
					checkoutItems,
					issueTicketsOnVerify,
				} as Prisma.InputJsonValue,
			},
		});

		return {
			payment,
			razorpayOrderId: razorpayOrder.id,
			razorpayKeyId: env.RAZORPAY_KEY_ID,
			amount: totalAmount,
			currency: input.currency,
			checkoutItems,
			prefill: {
				name: order.attendee.name,
				email: order.attendee.email,
				contact: order.attendee.phone ?? undefined,
			},
			notes: {
				orderId: order.id,
				eventName: order.event.name,
			},
		};
	}

	async verify(input: VerifyPaymentInput, actor: PaymentActor) {
		const expectedSignature = crypto
			.createHmac("sha256", env.RAZORPAY_KEY_SECRET)
			.update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
			.digest("hex");

		const isSignatureValid = crypto.timingSafeEqual(
			Buffer.from(expectedSignature),
			Buffer.from(input.razorpaySignature),
		);

		if (!isSignatureValid) {
			throw new BadRequestError("Invalid payment signature");
		}

		const payment = await prisma.payment.findFirst({
			where: {
				deletedAt: null,
				gatewayMeta: {
					path: ["razorpayOrderId"],
					equals: input.razorpayOrderId,
				},
				...this.buildAccessWhere(actor),
			},
			include: {
				order: true,
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found for this Razorpay order");
		}

		const gatewayMeta = this.normalizeGatewayMeta(payment.gatewayMeta);
		const checkoutItems = this.normalizeCheckoutItems(
			Array.isArray(gatewayMeta.checkoutItems)
				? gatewayMeta.checkoutItems
				: undefined,
		);
		const issueTicketsOnVerify = gatewayMeta.issueTicketsOnVerify === true;

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

			return { payment, alreadyVerified: true };
		}

		const razorpayPayment = await fetchRazorpayPayment(input.razorpayPaymentId);

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

		return { payment: updatedPayment, alreadyVerified: false };
	}

	async refund(id: string, input: RefundPaymentInput, actor: PaymentActor) {
		if (actor.role === "USER") {
			throw new ForbiddenError("Users cannot initiate refunds");
		}

		const payment = await prisma.payment.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
			include: {
				order: true,
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		if (payment.status !== "SUCCESS") {
			throw new BadRequestError("Can only refund successful payments");
		}

		if (!payment.transactionId) {
			throw new BadRequestError(
				"Payment has no transaction ID. Cannot process refund.",
			);
		}

		const refundAmount = input.amount ?? payment.amount;

		if (refundAmount > payment.amount) {
			throw new BadRequestError("Refund amount cannot exceed payment amount");
		}

		const razorpayRefund = await createRazorpayRefund(payment.transactionId, {
			amount: refundAmount,
			notes: input.notes,
		});

		const isFullRefund = refundAmount === payment.amount;

		const updatedPayment = await prisma.$transaction(async (tx) => {
			const updated = await tx.payment.update({
				where: { id: payment.id },
				data: {
					status: isFullRefund ? "REFUNDED" : "SUCCESS",
					gatewayMeta: {
						...(payment.gatewayMeta as object),
						refunds: [
							...((payment.gatewayMeta as { refunds?: unknown[] })?.refunds ??
								[]),
							{
								refundId: razorpayRefund.id,
								amount: refundAmount,
								status: razorpayRefund.status,
								createdAt: new Date().toISOString(),
							},
						],
					} as Prisma.InputJsonValue,
				},
			});

			if (isFullRefund) {
				await tx.order.update({
					where: { id: payment.orderId },
					data: { status: "CANCELLED" },
				});
			}

			return updated;
		});

		return {
			payment: updatedPayment,
			refund: {
				id: razorpayRefund.id,
				amount: refundAmount,
				status: razorpayRefund.status,
			},
		};
	}

	async update(id: string, input: UpdatePaymentInput, actor: PaymentActor) {
		if (actor.role === "USER") {
			throw new ForbiddenError("Users cannot update payment records directly");
		}

		const payment = await prisma.payment.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				orderId: true,
				amount: true,
				currency: true,
				gateway: true,
				status: true,
				order: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		this.ensureMutableFieldsUnchanged(input, payment);

		const nextStatus = input.status ?? payment.status;
		this.ensureValidStatusTransition(payment.status, nextStatus);

		const {
			orderId: _ignoredOrderId,
			amount: _ignoredAmount,
			currency: _ignoredCurrency,
			gateway: _ignoredGateway,
			status: _ignoredStatus,
			gatewayMeta,
			...rest
		} = input;

		try {
			return await prisma.$transaction(async (tx) => {
				const updatedPayment = await tx.payment.update({
					where: { id: payment.id },
					data: {
						...rest,
						status: nextStatus,
						gatewayMeta: gatewayMeta as Prisma.InputJsonValue | undefined,
					},
				});

				await this.syncOrderStatusForPayment(tx, payment.order, nextStatus);

				return updatedPayment;
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Payment transaction ID already exists");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Payment references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: PaymentActor) {
		if (actor.role === "USER") {
			throw new ForbiddenError("Users cannot delete payment records");
		}

		const payment = await prisma.payment.findFirst({
			where: {
				id,
				deletedAt: null,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				status: true,
				order: {
					select: {
						status: true,
					},
				},
			},
		});

		if (!payment) {
			throw new NotFoundError("Payment not found");
		}

		this.ensureCanDeletePayment(payment);

		await prisma.payment.update({
			where: { id: payment.id },
			data: { deletedAt: new Date() },
		});
	}

	async handleWebhook(input: RazorpayWebhookInput) {
		const transactionId = input.payload.payment.id;
		const orderReference = input.payload.payment.order_id;
		const mappedStatus = mapWebhookEventToPaymentStatus(input.event);

		if (!mappedStatus) {
			throw new BadRequestError("Unsupported Razorpay webhook event");
		}

		let payment = await prisma.payment.findFirst({
			where: {
				transactionId,
				deletedAt: null,
			},
			select: {
				id: true,
				orderId: true,
				amount: true,
				currency: true,
				gateway: true,
				gatewayMeta: true,
				transactionId: true,
				status: true,
				deletedAt: true,
				order: {
					select: {
						id: true,
						eventId: true,
						attendeeId: true,
						status: true,
					},
				},
			},
		});

		if (!payment && isCuid(orderReference)) {
			payment = await prisma.payment.findFirst({
				where: {
					orderId: orderReference,
					deletedAt: null,
				},
				select: {
					id: true,
					orderId: true,
					amount: true,
					currency: true,
					gateway: true,
					gatewayMeta: true,
					transactionId: true,
					status: true,
					deletedAt: true,
					order: {
						select: {
							id: true,
							eventId: true,
							attendeeId: true,
							status: true,
						},
					},
				},
			});
		}

		if (!payment || payment.deletedAt) {
			throw new BadRequestError("Payment transaction not found");
		}

		if (payment.gateway !== "RAZORPAY") {
			throw new BadRequestError("Webhook gateway mismatch for payment");
		}

		if (payment.transactionId && payment.transactionId !== transactionId) {
			throw new BadRequestError("Transaction ID mismatch for payment");
		}

		if (payment.amount !== input.payload.payment.amount) {
			throw new BadRequestError("Webhook payment amount mismatch");
		}

		if (
			payment.currency.toUpperCase() !==
			input.payload.payment.currency.toUpperCase()
		) {
			throw new BadRequestError("Webhook payment currency mismatch");
		}

		const existingGatewayMeta = this.normalizeGatewayMeta(payment.gatewayMeta);
		const checkoutItems = this.normalizeCheckoutItems(
			Array.isArray(existingGatewayMeta.checkoutItems)
				? existingGatewayMeta.checkoutItems
				: undefined,
		);
		const issueTicketsOnVerify =
			existingGatewayMeta.issueTicketsOnVerify === true;

		const ensureDeferredIssuance = async () => {
			if (!issueTicketsOnVerify || mappedStatus !== "SUCCESS") {
				return;
			}

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
		};

		if (
			payment.status === mappedStatus &&
			payment.transactionId === transactionId
		) {
			await ensureDeferredIssuance();
			return payment;
		}

		if (payment.status === "REFUNDED") {
			return payment;
		}

		if (payment.status === "SUCCESS" && mappedStatus !== "REFUNDED") {
			await ensureDeferredIssuance();
			return payment;
		}

		const normalizedGatewayMeta = {
			...existingGatewayMeta,
			webhookEvent: input.event,
			webhookPayload: input,
			webhookReceivedAt: new Date().toISOString(),
		} as Prisma.InputJsonValue;

		return prisma.$transaction(async (tx) => {
			const updatedPayment = await tx.payment.update({
				where: { id: payment.id },
				data: {
					status: mappedStatus,
					transactionId,
					gatewayMeta: normalizedGatewayMeta,
				},
			});

			if (mappedStatus === "SUCCESS" && issueTicketsOnVerify) {
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

			await this.syncOrderStatusForPayment(tx, payment.order, mappedStatus);

			return updatedPayment;
		});
	}
}

export const paymentsService = new PaymentsService();
