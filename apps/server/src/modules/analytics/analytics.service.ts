import { type Prisma, prisma, type UserRole } from "@unievent/db";
import type {
	AnalyticsFilterInput,
	AttendeeAnalytics,
	EventAnalytics,
	RevenueAnalytics,
} from "@unievent/schema";

import { ForbiddenError, NotFoundError } from "@/common/exceptions/app-error";

type AnalyticsActor = {
	userId: string;
	role: UserRole;
};

export class AnalyticsService {
	private ensureCanViewAnalytics(
		actor: AnalyticsActor,
		eventUserId?: string | null,
	) {
		if (actor.role === "ADMIN") {
			return;
		}

		if (actor.role === "HOST" && eventUserId === actor.userId) {
			return;
		}

		throw new ForbiddenError("You don't have permission to view analytics");
	}

	async getEventAnalytics(
		eventId: string,
		actor: AnalyticsActor,
	): Promise<EventAnalytics> {
		const event = await prisma.event.findUnique({
			where: { id: eventId },
			select: { userId: true },
		});

		if (!event) {
			throw new NotFoundError("Event not found");
		}

		this.ensureCanViewAnalytics(actor, event.userId);

		const [
			totalAttendees,
			totalTicketsSold,
			totalRevenue,
			totalCheckIns,
			ticketTierBreakdown,
		] = await Promise.all([
			prisma.attendee.count({ where: { eventId } }),
			prisma.ticket.count({ where: { eventId } }),
			prisma.payment.aggregate({
				where: {
					order: { eventId },
					status: "SUCCESS",
					deletedAt: null,
				},
				_sum: { amount: true },
			}),
			prisma.checkIn.count({ where: { eventId } }),
			prisma.ticketTier.findMany({
				where: { eventId },
				select: { id: true, name: true, soldCount: true, price: true },
			}),
		]);

		const revenue = totalRevenue._sum?.amount ?? 0;
		const checkInRate =
			totalTicketsSold > 0 ? totalCheckIns / totalTicketsSold : 0;

		return {
			eventId,
			totalAttendees,
			totalTicketsSold,
			totalRevenue: revenue,
			checkInRate,
			ticketTierBreakdown: ticketTierBreakdown.map((tier) => ({
				tierId: tier.id,
				tierName: tier.name,
				soldCount: tier.soldCount,
				revenue: tier.soldCount * tier.price,
			})),
		};
	}

	async getRevenueAnalytics(
		input: AnalyticsFilterInput,
		actor: AnalyticsActor,
	): Promise<RevenueAnalytics> {
		const where: Prisma.PaymentWhereInput = {
			status: "SUCCESS",
			deletedAt: null,
		};

		if (input.eventId) {
			const event = await prisma.event.findUnique({
				where: { id: input.eventId },
				select: { userId: true },
			});

			if (!event) {
				throw new NotFoundError("Event not found");
			}

			this.ensureCanViewAnalytics(actor, event.userId);
			where.order = { eventId: input.eventId };
		} else if (actor.role === "HOST") {
			where.order = { event: { userId: actor.userId } };
		} else if (actor.role === "USER") {
			where.order = { attendee: { userId: actor.userId } };
		}

		if (input.startDate || input.endDate) {
			where.createdAt = {};
			if (input.startDate) where.createdAt.gte = input.startDate;
			if (input.endDate) where.createdAt.lte = input.endDate;
		}

		const [totalRevenueResult, totalOrders, payments] = await Promise.all([
			prisma.payment.aggregate({
				where,
				_sum: { amount: true },
			}),
			prisma.payment.count({ where }),
			prisma.payment.findMany({
				where,
				select: { amount: true, createdAt: true },
				orderBy: { createdAt: "desc" },
				take: 100,
			}),
		]);

		const totalRevenue = totalRevenueResult._sum?.amount ?? 0;
		const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		const revenueByDateMap = new Map<
			string,
			{ revenue: number; orders: number }
		>();
		for (const payment of payments) {
			const dateKey = this.getDateKey(payment.createdAt, input.groupBy);
			const existing = revenueByDateMap.get(dateKey) ?? {
				revenue: 0,
				orders: 0,
			};
			existing.revenue += payment.amount;
			existing.orders += 1;
			revenueByDateMap.set(dateKey, existing);
		}

		const revenueByDate = Array.from(revenueByDateMap.entries())
			.map(([date, data]) => ({
				date,
				revenue: data.revenue,
				orders: data.orders,
			}))
			.slice(0, 30);

		return { totalRevenue, totalOrders, averageOrderValue, revenueByDate };
	}

	async getAttendeeAnalytics(
		input: AnalyticsFilterInput,
		actor: AnalyticsActor,
	): Promise<AttendeeAnalytics> {
		const where: Prisma.AttendeeWhereInput = {};

		if (input.eventId) {
			const event = await prisma.event.findUnique({
				where: { id: input.eventId },
				select: { userId: true },
			});

			if (!event) {
				throw new NotFoundError("Event not found");
			}

			this.ensureCanViewAnalytics(actor, event.userId);
			where.eventId = input.eventId;
		} else if (actor.role === "HOST") {
			where.event = { userId: actor.userId };
		} else if (actor.role === "USER") {
			where.userId = actor.userId;
		}

		if (input.startDate || input.endDate) {
			where.createdAt = {};
			if (input.startDate) where.createdAt.gte = input.startDate;
			if (input.endDate) where.createdAt.lte = input.endDate;
		}

		const [totalAttendees, uniqueAttendees, totalCheckIns, attendees] =
			await Promise.all([
				prisma.attendee.count({ where }),
				prisma.attendee
					.groupBy({
						by: ["email"],
						where,
					})
					.then((groups) => groups.length),
				prisma.checkIn.count({
					where: input.eventId ? { eventId: input.eventId } : {},
				}),
				prisma.attendee.findMany({
					where,
					select: { createdAt: true },
					orderBy: { createdAt: "desc" },
					take: 100,
				}),
			]);

		const checkInRate = totalAttendees > 0 ? totalCheckIns / totalAttendees : 0;

		const attendeesByDateMap = new Map<string, number>();
		for (const attendee of attendees) {
			const dateKey = this.getDateKey(attendee.createdAt, input.groupBy);
			const existing = attendeesByDateMap.get(dateKey) ?? 0;
			attendeesByDateMap.set(dateKey, existing + 1);
		}

		const attendeesByDate = Array.from(attendeesByDateMap.entries())
			.map(([date, count]) => ({ date, count }))
			.slice(0, 30);

		return { totalAttendees, uniqueAttendees, checkInRate, attendeesByDate };
	}

	private getDateKey(date: Date, groupBy: "day" | "week" | "month"): string {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");

		if (groupBy === "day") return `${year}-${month}-${day}`;
		if (groupBy === "week") return `${year}-W${this.getWeekNumber(d)}`;
		return `${year}-${month}`;
	}

	private getWeekNumber(date: Date): number {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		const yearStart = new Date(d.getFullYear(), 0, 1);
		return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
	}
}

export const analyticsService = new AnalyticsService();
