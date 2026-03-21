import db from "@voltaze/db";
import type {
	CheckInInput,
	CreatePromoCodeInput,
	CreateTicketTierInput,
	PurchaseTicketInput,
} from "@voltaze/schema/ticket";
import { AppError, NotFoundError } from "../lib/errors";
import { createRazorpayOrder } from "../lib/razorpay";
import { generateId } from "../lib/utils";

// ── Ticket Tiers ──

export async function createTier(
	eventId: string,
	input: CreateTicketTierInput,
) {
	const count = await db.ticketTier.count({ where: { eventId } });
	return db.ticketTier.create({
		data: { ...input, eventId, position: count },
	});
}

export async function listTiers(eventId: string) {
	return db.ticketTier.findMany({
		where: { eventId },
		orderBy: { position: "asc" },
	});
}

export async function updateTier(
	tierId: string,
	input: Partial<CreateTicketTierInput>,
) {
	return db.ticketTier.update({ where: { id: tierId }, data: input });
}

export async function deleteTier(tierId: string) {
	return db.ticketTier.delete({ where: { id: tierId } });
}

// ── Promo Codes ──

export async function createPromoCode(
	eventId: string,
	input: CreatePromoCodeInput,
) {
	return db.promoCode.create({ data: { ...input, eventId } });
}

export async function listPromoCodes(eventId: string) {
	return db.promoCode.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
	});
}

export async function validatePromoCode(eventId: string, code: string) {
	const promo = await db.promoCode.findUnique({
		where: { eventId_code: { eventId, code } },
	});

	if (!promo || !promo.isActive) return null;
	if (promo.maxUses && promo.timesUsed >= promo.maxUses) return null;
	if (promo.validFrom && new Date() < promo.validFrom) return null;
	if (promo.validUntil && new Date() > promo.validUntil) return null;

	return promo;
}

// ── Purchase ──

export async function purchaseTicket(
	eventId: string,
	userId: string,
	userEmail: string,
	input: PurchaseTicketInput,
) {
	const tier = await db.ticketTier.findUnique({ where: { id: input.tierId } });
	if (!tier || tier.eventId !== eventId) throw new NotFoundError("Ticket tier");

	// Check availability
	if (tier.quantity !== null && tier.sold + input.quantity > tier.quantity) {
		throw new AppError("Not enough tickets available", 400, "SOLD_OUT");
	}

	// Check sales window
	const now = new Date();
	if (tier.salesStart && now < tier.salesStart)
		throw new AppError("Sales haven't started", 400, "NOT_ON_SALE");
	if (tier.salesEnd && now > tier.salesEnd)
		throw new AppError("Sales have ended", 400, "SALES_ENDED");

	// Apply promo code
	let discount = 0;
	let promoCodeId: string | undefined;
	if (input.promoCode) {
		const promo = await validatePromoCode(eventId, input.promoCode);
		if (promo) {
			promoCodeId = promo.id;
			discount =
				promo.type === "PERCENT"
					? Math.floor((tier.price * promo.value) / 100)
					: promo.value;
		}
	}

	const finalPrice = Math.max(0, tier.price - discount) * input.quantity;
	const ticketCode = generateTicketCode();

	// Free ticket — issue immediately
	if (finalPrice === 0) {
		const ticket = await db.$transaction(async (tx) => {
			await tx.ticketTier.update({
				where: { id: tier.id },
				data: { sold: { increment: input.quantity } },
			});

			if (promoCodeId) {
				await tx.promoCode.update({
					where: { id: promoCodeId },
					data: { timesUsed: { increment: 1 } },
				});
			}

			return tx.ticket.create({
				data: {
					code: ticketCode,
					tierId: tier.id,
					userId,
					promoCodeId,
					status: "VALID",
				},
			});
		});

		return { ticket, paymentRequired: false };
	}

	// Paid ticket — create Razorpay order
	const orderId = generateId("order");

	const ticket = await db.$transaction(async (tx) => {
		const t = await tx.ticket.create({
			data: {
				code: ticketCode,
				tierId: tier.id,
				userId,
				promoCodeId,
				status: "VALID",
			},
		});

		const rzpOrder = await createRazorpayOrder({
			orderId,
			amount: finalPrice,
			customerId: userId,
			customerEmail: userEmail,
			description: `Ticket purchase for event at ${tier.eventId}`,
			receipt: t.id,
		});

		await tx.payment.create({
			data: {
				ticketId: t.id,
				razorpayOrderId: rzpOrder.id,
				orderStatus: "CREATED",
				amount: finalPrice,
				currency: tier.currency,
			},
		});

		return t;
	});

	return { ticket, paymentRequired: true, orderId };
}

// ── Check-in ──

export async function checkIn(input: CheckInInput, checkedInById?: string) {
	const ticket = await db.ticket.findUnique({
		where: { code: input.ticketCode },
	});
	if (!ticket) throw new NotFoundError("Ticket");
	if (ticket.status !== "VALID") {
		throw new AppError(
			`Ticket is ${ticket.status.toLowerCase()}`,
			400,
			"INVALID_TICKET",
		);
	}

	return db.$transaction(async (tx) => {
		await tx.ticket.update({
			where: { id: ticket.id },
			data: { status: "USED" },
		});

		return tx.checkIn.create({
			data: {
				ticketId: ticket.id,
				method: input.method,
				checkedInById,
			},
		});
	});
}

// ── Helpers ──

function generateTicketCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 8; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}
