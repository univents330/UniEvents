import db from "@voltaze/db";
import type {
	CreateEventInput,
	EventQuery,
	UpdateEventInput,
} from "@voltaze/schema/event";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function createEvent(
	orgId: string,
	userId: string,
	input: CreateEventInput,
) {
	// Verify user is admin/owner of the org
	const member = await db.orgMember.findUnique({
		where: { userId_orgId: { userId, orgId } },
	});
	if (!member || member.role === "MEMBER") {
		throw new ForbiddenError("Must be an org admin to create events");
	}

	const slug = input.slug ?? slugify(input.title);
	const exists = await db.event.findUnique({ where: { slug } });
	if (exists) throw new ConflictError("Event slug already taken");

	return db.event.create({
		data: {
			...input,
			slug,
			orgId,
		},
	});
}

export async function getEventBySlug(slug: string) {
	const event = await db.event.findUnique({
		where: { slug },
		include: {
			organization: {
				select: { id: true, name: true, slug: true, logoUrl: true },
			},
			ticketTiers: {
				where: { visibility: "PUBLIC" },
				orderBy: { position: "asc" },
			},
			speakers: { orderBy: { position: "asc" } },
			sponsors: { orderBy: { position: "asc" } },
			tracks: {
				orderBy: { position: "asc" },
				include: {
					sessions: {
						orderBy: { startsAt: "asc" },
						include: { speakers: { include: { speaker: true } } },
					},
				},
			},
			tags: { include: { tag: true } },
			_count: { select: { waitlist: true } },
		},
	});
	if (!event) throw new NotFoundError("Event");
	return event;
}

export async function getEventById(eventId: string) {
	const event = await db.event.findUnique({ where: { id: eventId } });
	if (!event) throw new NotFoundError("Event");
	return event;
}

export async function listEvents(query: EventQuery) {
	const { page, limit, status, visibility, format, from, to, search } = query;

	const where: Record<string, unknown> = {};
	if (status) where.status = status;
	if (visibility) where.visibility = visibility;
	if (format) where.format = format;
	if (from || to) {
		where.startsAt = {};
		if (from) (where.startsAt as Record<string, unknown>).gte = from;
		if (to) (where.startsAt as Record<string, unknown>).lte = to;
	}
	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ description: { contains: search, mode: "insensitive" } },
		];
	}

	const [events, total] = await Promise.all([
		db.event.findMany({
			where,
			include: {
				organization: {
					select: { id: true, name: true, slug: true, logoUrl: true },
				},
				_count: { select: { ticketTiers: true } },
			},
			orderBy: { startsAt: "asc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		db.event.count({ where }),
	]);

	return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listOrgEvents(orgId: string) {
	return db.event.findMany({
		where: { orgId },
		include: { _count: { select: { ticketTiers: true } } },
		orderBy: { startsAt: "desc" },
	});
}

export async function updateEvent(
	eventId: string,
	userId: string,
	input: UpdateEventInput,
) {
	const event = await getEventById(eventId);
	await assertEventAdmin(event.orgId, userId);

	if (input.slug) {
		const exists = await db.event.findFirst({
			where: { slug: input.slug, id: { not: eventId } },
		});
		if (exists) throw new ConflictError("Event slug already taken");
	}

	return db.event.update({
		where: { id: eventId },
		data: input,
	});
}

export async function deleteEvent(eventId: string, userId: string) {
	const event = await getEventById(eventId);
	await assertEventAdmin(event.orgId, userId);
	return db.event.delete({ where: { id: eventId } });
}

// ── Helpers ──

async function assertEventAdmin(orgId: string, userId: string) {
	const member = await db.orgMember.findUnique({
		where: { userId_orgId: { userId, orgId } },
	});
	if (!member || member.role === "MEMBER") {
		throw new ForbiddenError("Must be an org admin");
	}
}
