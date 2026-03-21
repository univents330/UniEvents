import db from "@voltaze/db";
import type { CreateOrgInput, UpdateOrgInput } from "@voltaze/schema/org";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function createOrg(userId: string, input: CreateOrgInput) {
	const slug = input.slug ?? slugify(input.name);

	const exists = await db.organization.findUnique({ where: { slug } });
	if (exists) throw new ConflictError("Organization slug already taken");

	return db.organization.create({
		data: {
			...input,
			slug,
			members: {
				create: { userId, role: "OWNER" },
			},
		},
		include: { members: true },
	});
}

export async function getOrgById(orgId: string) {
	const org = await db.organization.findUnique({
		where: { id: orgId },
		include: { members: true, _count: { select: { events: true } } },
	});
	if (!org) throw new NotFoundError("Organization");
	return org;
}

export async function getUserOrgs(userId: string) {
	return db.organization.findMany({
		where: { members: { some: { userId } } },
		include: { _count: { select: { events: true, members: true } } },
		orderBy: { createdAt: "desc" },
	});
}

export async function updateOrg(
	orgId: string,
	userId: string,
	input: UpdateOrgInput,
) {
	await assertOrgAdmin(orgId, userId);

	if (input.slug) {
		const exists = await db.organization.findFirst({
			where: { slug: input.slug, id: { not: orgId } },
		});
		if (exists) throw new ConflictError("Organization slug already taken");
	}

	return db.organization.update({
		where: { id: orgId },
		data: input,
	});
}

export async function deleteOrg(orgId: string, userId: string) {
	await assertOrgOwner(orgId, userId);
	return db.organization.delete({ where: { id: orgId } });
}

export async function addMember(
	orgId: string,
	userId: string,
	targetUserId: string,
	role: string,
) {
	await assertOrgAdmin(orgId, userId);

	const exists = await db.orgMember.findUnique({
		where: { userId_orgId: { userId: targetUserId, orgId } },
	});
	if (exists) throw new ConflictError("User is already a member");

	return db.orgMember.create({
		data: {
			orgId,
			userId: targetUserId,
			role: role as "OWNER" | "ADMIN" | "MEMBER",
		},
	});
}

export async function removeMember(
	orgId: string,
	userId: string,
	targetUserId: string,
) {
	await assertOrgAdmin(orgId, userId);
	return db.orgMember.delete({
		where: { userId_orgId: { userId: targetUserId, orgId } },
	});
}

// ── Helpers ──

async function assertOrgAdmin(orgId: string, userId: string) {
	const member = await db.orgMember.findUnique({
		where: { userId_orgId: { userId, orgId } },
	});
	if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
		throw new ForbiddenError("Must be an org admin");
	}
	return member;
}

async function assertOrgOwner(orgId: string, userId: string) {
	const member = await db.orgMember.findUnique({
		where: { userId_orgId: { userId, orgId } },
	});
	if (!member || member.role !== "OWNER") {
		throw new ForbiddenError("Must be the org owner");
	}
	return member;
}
