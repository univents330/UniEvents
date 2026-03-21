import db from "@voltaze/db";
import type {
	CreateCommunityInput,
	CreateInviteInput,
	JoinWaitlistInput,
	UpdateCommunityInput,
} from "@voltaze/schema/community";
import { ConflictError, NotFoundError } from "../lib/errors";

// ── Community CRUD ──

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function createCommunity(
	orgId: string,
	input: CreateCommunityInput,
) {
	const slug = input.slug ?? slugify(input.name);
	const exists = await db.community.findUnique({ where: { slug } });
	if (exists) throw new ConflictError("Community slug already taken");

	return db.community.create({ data: { ...input, slug, orgId } });
}

export async function getCommunity(communityId: string) {
	const community = await db.community.findUnique({
		where: { id: communityId },
		include: { _count: { select: { members: true } } },
	});
	if (!community) throw new NotFoundError("Community");
	return community;
}

export async function updateCommunity(
	communityId: string,
	input: UpdateCommunityInput,
) {
	return db.community.update({ where: { id: communityId }, data: input });
}

export async function joinCommunity(communityId: string, userId: string) {
	const exists = await db.communityMember.findUnique({
		where: { communityId_userId: { communityId, userId } },
	});
	if (exists) throw new ConflictError("Already a member");

	return db.communityMember.create({ data: { communityId, userId } });
}

// ── Invites ──

export async function createInvite(eventId: string, input: CreateInviteInput) {
	const exists = await db.invite.findUnique({
		where: { eventId_email: { eventId, email: input.email } },
	});
	if (exists) throw new ConflictError("Invite already sent to this email");

	const code = generateCode();
	return db.invite.create({
		data: { eventId, email: input.email, message: input.message, code },
	});
}

export async function listInvites(eventId: string) {
	return db.invite.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
	});
}

// ── Waitlist ──

export async function joinWaitlist(
	eventId: string,
	userId: string | undefined,
	input: JoinWaitlistInput,
) {
	const exists = await db.waitlist.findUnique({
		where: { eventId_email: { eventId, email: input.email } },
	});
	if (exists) throw new ConflictError("Already on the waitlist");

	const count = await db.waitlist.count({ where: { eventId } });
	return db.waitlist.create({
		data: { eventId, userId, email: input.email, position: count + 1 },
	});
}

export async function listWaitlist(eventId: string) {
	return db.waitlist.findMany({
		where: { eventId },
		orderBy: { position: "asc" },
	});
}

// ── Helpers ──

function generateCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 10; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}
