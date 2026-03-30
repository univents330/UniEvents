import { existsSync } from "node:fs";
import path from "node:path";

import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";

import {
	CheckInMethod,
	EventMode,
	EventStatus,
	EventType,
	EventVisibility,
	OrderStatus,
	PassStatus,
	PassType,
	PaymentGateway,
	PaymentStatus,
	PrismaClient,
	UserRole,
} from "./generated/client";

type SeedMode = "minimal" | "detailed" | "large-demo";

function getArgValue(flagName: string): string | undefined {
	const inlinePrefix = `--${flagName}=`;

	for (const arg of process.argv) {
		if (arg.startsWith(inlinePrefix)) {
			return arg.slice(inlinePrefix.length);
		}
	}

	const directFlag = `--${flagName}`;
	const directFlagIndex = process.argv.findIndex((arg) => arg === directFlag);

	if (directFlagIndex === -1) {
		return undefined;
	}

	const nextArg = process.argv[directFlagIndex + 1];

	if (!nextArg || nextArg.startsWith("--")) {
		return undefined;
	}

	return nextArg;
}

function parseSeedMode(): SeedMode {
	const modeCandidate =
		getArgValue("mode") ?? process.env.SEED_MODE ?? "detailed";
	const normalizedMode = modeCandidate.trim().toLowerCase();

	if (normalizedMode === "minimal" || normalizedMode === "min") {
		return "minimal";
	}

	if (
		normalizedMode === "detailed" ||
		normalizedMode === "default" ||
		normalizedMode === "full"
	) {
		return "detailed";
	}

	if (
		normalizedMode === "large-demo" ||
		normalizedMode === "large_demo" ||
		normalizedMode === "large" ||
		normalizedMode === "demo"
	) {
		return "large-demo";
	}

	throw new Error(
		`Unsupported seed mode: ${modeCandidate}. Use one of: minimal, detailed, large-demo.`,
	);
}

function parseLargeDemoCount(): number {
	const countCandidate = getArgValue("count") ?? process.env.SEED_LARGE_COUNT;

	if (!countCandidate) {
		return 150;
	}

	const parsedCount = Number.parseInt(countCandidate, 10);

	if (Number.isNaN(parsedCount) || parsedCount < 1 || parsedCount > 2000) {
		throw new Error(
			`Invalid large demo count: ${countCandidate}. Use an integer between 1 and 2000.`,
		);
	}

	return parsedCount;
}

const envCandidates = [
	path.resolve(import.meta.dir, "../../../apps/server/.env"),
	path.resolve(process.cwd(), "apps/server/.env"),
	path.resolve(process.cwd(), "../../apps/server/.env"),
] as const;

let resolvedEnvPath: string | null = null;

for (const envPath of envCandidates) {
	if (!existsSync(envPath)) {
		continue;
	}

	dotenv.config({
		path: envPath,
		override: false,
	});

	resolvedEnvPath = envPath;
	break;
}

if (!resolvedEnvPath) {
	dotenv.config();
}

if (!process.env.DATABASE_URL) {
	throw new Error(
		`DATABASE_URL is missing. Add it to apps/server/.env before running db:seed. Attempted: ${envCandidates.join(", ")}`,
	);
}

const prisma = new PrismaClient({
	adapter: new PrismaNeon({
		connectionString: process.env.DATABASE_URL,
	}),
});

const seedIds = {
	users: {
		admin: "seed_user_admin",
		hostPriya: "seed_user_host_priya",
		hostArjun: "seed_user_host_arjun",
		attendeeAva: "seed_user_attendee_ava",
		attendeeLiam: "seed_user_attendee_liam",
		attendeeNoah: "seed_user_attendee_noah",
	},
	sessions: {
		admin: "seed_session_admin",
		hostPriya: "seed_session_host_priya",
		attendeeAva: "seed_session_attendee_ava",
	},
	accounts: {
		adminCredentials: "seed_account_admin_credentials",
		hostPriyaCredentials: "seed_account_host_priya_credentials",
		hostArjunCredentials: "seed_account_host_arjun_credentials",
		attendeeAvaCredentials: "seed_account_attendee_ava_credentials",
	},
	verifications: {
		adminEmail: "seed_verification_admin_email",
		attendeeNoahEmail: "seed_verification_attendee_noah_email",
	},
	events: {
		launch2026: "seed_event_voltaze_launch_2026",
		communityLive2026: "seed_event_community_live_2026",
		foundersCircle2026: "seed_event_founders_circle_2026",
		hackNightCancelled2026: "seed_event_hack_night_cancelled_2026",
	},
	tiers: {
		launchGeneral: "seed_tier_launch_general",
		launchVip: "seed_tier_launch_vip",
		launchBackstage: "seed_tier_launch_backstage",
		communityFree: "seed_tier_community_free",
		foundersEarlyBird: "seed_tier_founders_early_bird",
		hackNightGeneral: "seed_tier_hack_night_general",
	},
	attendees: {
		launchAva: "seed_attendee_launch_ava",
		launchLiam: "seed_attendee_launch_liam",
		launchWalkIn: "seed_attendee_launch_walk_in",
		communityNoah: "seed_attendee_community_noah",
		communityGuest: "seed_attendee_community_guest",
		foundersAva: "seed_attendee_founders_ava",
	},
	orders: {
		launchAvaCompleted: "seed_order_launch_ava_completed",
		launchLiamCompleted: "seed_order_launch_liam_completed",
		launchWalkInCancelled: "seed_order_launch_walk_in_cancelled",
		communityNoahCompleted: "seed_order_community_noah_completed",
		communityGuestPending: "seed_order_community_guest_pending",
		foundersAvaPending: "seed_order_founders_ava_pending",
	},
	tickets: {
		launchAvaGeneral: "seed_ticket_launch_ava_general",
		launchLiamVip: "seed_ticket_launch_liam_vip",
		launchWalkInBackstage: "seed_ticket_launch_walk_in_backstage",
		communityNoahFree: "seed_ticket_community_noah_free",
	},
	passes: {
		launchAvaActive: "seed_pass_launch_ava_active",
		launchLiamUsed: "seed_pass_launch_liam_used",
		launchWalkInCancelled: "seed_pass_launch_walk_in_cancelled",
		communityNoahUsed: "seed_pass_community_noah_used",
	},
	payments: {
		launchAvaSuccess: "seed_payment_launch_ava_success",
		launchLiamSuccess: "seed_payment_launch_liam_success",
		launchWalkInRefunded: "seed_payment_launch_walk_in_refunded",
		foundersAvaPending: "seed_payment_founders_ava_pending",
	},
	checkIns: {
		launchLiam: "seed_checkin_launch_liam",
		communityNoah: "seed_checkin_community_noah",
	},
} as const;

type DetailedCoverageSummary = {
	users: number;
	events: number;
	tiers: number;
	attendees: number;
	orders: number;
	tickets: number;
	passes: number;
	payments: number;
	checkIns: number;
};

type DetailedSeedResult = {
	adminEmail: string;
	primaryEventSlug: string;
	primaryEventId: string;
	primaryTierId: string;
	summary: DetailedCoverageSummary;
};

async function collectDetailedCoverageSummary(): Promise<DetailedCoverageSummary> {
	return {
		users: await prisma.user.count({
			where: { id: { in: Object.values(seedIds.users) } },
		}),
		events: await prisma.event.count({
			where: { id: { in: Object.values(seedIds.events) } },
		}),
		tiers: await prisma.ticketTier.count({
			where: { id: { in: Object.values(seedIds.tiers) } },
		}),
		attendees: await prisma.attendee.count({
			where: { id: { in: Object.values(seedIds.attendees) } },
		}),
		orders: await prisma.order.count({
			where: { id: { in: Object.values(seedIds.orders) } },
		}),
		tickets: await prisma.ticket.count({
			where: { id: { in: Object.values(seedIds.tickets) } },
		}),
		passes: await prisma.pass.count({
			where: { id: { in: Object.values(seedIds.passes) } },
		}),
		payments: await prisma.payment.count({
			where: { id: { in: Object.values(seedIds.payments) } },
		}),
		checkIns: await prisma.checkIn.count({
			where: { id: { in: Object.values(seedIds.checkIns) } },
		}),
	};
}

async function seedDetailed(): Promise<DetailedSeedResult> {
	const seededAt = new Date("2026-03-30T09:00:00.000Z");

	const adminUser = await prisma.user.upsert({
		where: { id: seedIds.users.admin },
		update: {
			name: "Voltaze Admin",
			email: "admin.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
			role: UserRole.ADMIN,
		},
		create: {
			id: seedIds.users.admin,
			name: "Voltaze Admin",
			email: "admin.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
			role: UserRole.ADMIN,
		},
	});

	const hostPriyaUser = await prisma.user.upsert({
		where: { id: seedIds.users.hostPriya },
		update: {
			name: "Priya Nair",
			email: "priya.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
		create: {
			id: seedIds.users.hostPriya,
			name: "Priya Nair",
			email: "priya.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
	});

	const hostArjunUser = await prisma.user.upsert({
		where: { id: seedIds.users.hostArjun },
		update: {
			name: "Arjun Mehta",
			email: "arjun.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
			role: UserRole.HOST,
		},
		create: {
			id: seedIds.users.hostArjun,
			name: "Arjun Mehta",
			email: "arjun.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
			role: UserRole.HOST,
		},
	});

	const attendeeAvaUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeAva },
		update: {
			name: "Ava Sharma",
			email: "ava.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeAva,
			name: "Ava Sharma",
			email: "ava.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.USER,
		},
	});

	const attendeeLiamUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeLiam },
		update: {
			name: "Liam Dsouza",
			email: "liam.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeLiam,
			name: "Liam Dsouza",
			email: "liam.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e",
			role: UserRole.USER,
		},
	});

	const attendeeNoahUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeNoah },
		update: {
			name: "Noah Fernandez",
			email: "noah.seed@voltaze.local",
			emailVerified: false,
			image: "https://images.unsplash.com/photo-1521119989659-a83eee488004",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeNoah,
			name: "Noah Fernandez",
			email: "noah.seed@voltaze.local",
			emailVerified: false,
			image: "https://images.unsplash.com/photo-1521119989659-a83eee488004",
			role: UserRole.USER,
		},
	});

	const sessionExpiry = new Date("2026-12-31T23:59:59.000Z");

	await prisma.session.upsert({
		where: { id: seedIds.sessions.admin },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_admin",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: adminUser.id,
		},
		create: {
			id: seedIds.sessions.admin,
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_admin",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: adminUser.id,
		},
	});

	await prisma.session.upsert({
		where: { id: seedIds.sessions.hostPriya },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_host_priya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: hostPriyaUser.id,
		},
		create: {
			id: seedIds.sessions.hostPriya,
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_host_priya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: hostPriyaUser.id,
		},
	});

	await prisma.session.upsert({
		where: { id: seedIds.sessions.attendeeAva },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_attendee_ava",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: attendeeAvaUser.id,
		},
		create: {
			id: seedIds.sessions.attendeeAva,
			expiresAt: sessionExpiry,
			token: "seed_refresh_token_attendee_ava",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: attendeeAvaUser.id,
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.adminCredentials },
		update: {
			accountId: adminUser.email,
			providerId: "credentials",
			userId: adminUser.id,
			password: "$2b$12$seed.admin.password.hash",
		},
		create: {
			id: seedIds.accounts.adminCredentials,
			accountId: adminUser.email,
			providerId: "credentials",
			userId: adminUser.id,
			password: "$2b$12$seed.admin.password.hash",
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.hostPriyaCredentials },
		update: {
			accountId: hostPriyaUser.email,
			providerId: "credentials",
			userId: hostPriyaUser.id,
			password: "$2b$12$seed.host.priya.password.hash",
		},
		create: {
			id: seedIds.accounts.hostPriyaCredentials,
			accountId: hostPriyaUser.email,
			providerId: "credentials",
			userId: hostPriyaUser.id,
			password: "$2b$12$seed.host.priya.password.hash",
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.hostArjunCredentials },
		update: {
			accountId: hostArjunUser.email,
			providerId: "credentials",
			userId: hostArjunUser.id,
			password: "$2b$12$seed.host.arjun.password.hash",
		},
		create: {
			id: seedIds.accounts.hostArjunCredentials,
			accountId: hostArjunUser.email,
			providerId: "credentials",
			userId: hostArjunUser.id,
			password: "$2b$12$seed.host.arjun.password.hash",
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.attendeeAvaCredentials },
		update: {
			accountId: attendeeAvaUser.email,
			providerId: "credentials",
			userId: attendeeAvaUser.id,
			password: "$2b$12$seed.attendee.ava.password.hash",
		},
		create: {
			id: seedIds.accounts.attendeeAvaCredentials,
			accountId: attendeeAvaUser.email,
			providerId: "credentials",
			userId: attendeeAvaUser.id,
			password: "$2b$12$seed.attendee.ava.password.hash",
		},
	});

	await prisma.verification.upsert({
		where: { id: seedIds.verifications.adminEmail },
		update: {
			identifier: adminUser.email,
			value: "ADMIN-OTP-123456",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
		create: {
			id: seedIds.verifications.adminEmail,
			identifier: adminUser.email,
			value: "ADMIN-OTP-123456",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
	});

	await prisma.verification.upsert({
		where: { id: seedIds.verifications.attendeeNoahEmail },
		update: {
			identifier: attendeeNoahUser.email,
			value: "NOAH-OTP-654321",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
		create: {
			id: seedIds.verifications.attendeeNoahEmail,
			identifier: attendeeNoahUser.email,
			value: "NOAH-OTP-654321",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
	});

	const launchEvent = await prisma.event.upsert({
		where: { id: seedIds.events.launch2026 },
		update: {
			name: "Voltaze Launch 2026",
			slug: "voltaze-launch-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7",
			venueName: "Voltaze Arena",
			address: "Bengaluru, Karnataka, India",
			latitude: "12.9716",
			longitude: "77.5946",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-06-15T10:00:00.000Z"),
			endDate: new Date("2026-06-15T18:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Official Voltaze launch with keynote sessions, product demos, and partner showcases.",
		},
		create: {
			id: seedIds.events.launch2026,
			name: "Voltaze Launch 2026",
			slug: "voltaze-launch-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7",
			venueName: "Voltaze Arena",
			address: "Bengaluru, Karnataka, India",
			latitude: "12.9716",
			longitude: "77.5946",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-06-15T10:00:00.000Z"),
			endDate: new Date("2026-06-15T18:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Official Voltaze launch with keynote sessions, product demos, and partner showcases.",
		},
	});

	const communityLiveEvent = await prisma.event.upsert({
		where: { id: seedIds.events.communityLive2026 },
		update: {
			name: "Voltaze Community Live 2026",
			slug: "voltaze-community-live-2026",
			userId: hostArjunUser.id,
			coverUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865",
			thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
			venueName: "Voltaze Stream Room",
			address: "Online Event",
			latitude: "0",
			longitude: "0",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-07-10T13:00:00.000Z"),
			endDate: new Date("2026-07-10T16:00:00.000Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Community meetup with lightning talks, roadmap discussion, and a live Q&A with the core team.",
		},
		create: {
			id: seedIds.events.communityLive2026,
			name: "Voltaze Community Live 2026",
			slug: "voltaze-community-live-2026",
			userId: hostArjunUser.id,
			coverUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865",
			thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
			venueName: "Voltaze Stream Room",
			address: "Online Event",
			latitude: "0",
			longitude: "0",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-07-10T13:00:00.000Z"),
			endDate: new Date("2026-07-10T16:00:00.000Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Community meetup with lightning talks, roadmap discussion, and a live Q&A with the core team.",
		},
	});

	const foundersCircleEvent = await prisma.event.upsert({
		where: { id: seedIds.events.foundersCircle2026 },
		update: {
			name: "Voltaze Founders Circle",
			slug: "voltaze-founders-circle-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
			thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
			venueName: "Hilton Convention Hall",
			address: "Mumbai, Maharashtra, India",
			latitude: "19.0760",
			longitude: "72.8777",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-08-21T09:30:00.000Z"),
			endDate: new Date("2026-08-21T17:30:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PRIVATE,
			status: EventStatus.DRAFT,
			description:
				"Invite-only founder networking and investor roundtables. Event is still being finalized.",
		},
		create: {
			id: seedIds.events.foundersCircle2026,
			name: "Voltaze Founders Circle",
			slug: "voltaze-founders-circle-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
			thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
			venueName: "Hilton Convention Hall",
			address: "Mumbai, Maharashtra, India",
			latitude: "19.0760",
			longitude: "72.8777",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-08-21T09:30:00.000Z"),
			endDate: new Date("2026-08-21T17:30:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PRIVATE,
			status: EventStatus.DRAFT,
			description:
				"Invite-only founder networking and investor roundtables. Event is still being finalized.",
		},
	});

	const hackNightCancelledEvent = await prisma.event.upsert({
		where: { id: seedIds.events.hackNightCancelled2026 },
		update: {
			name: "Voltaze Hack Night",
			slug: "voltaze-hack-night-2026",
			userId: hostArjunUser.id,
			coverUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
			thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475",
			venueName: "Nexus Hall",
			address: "Hyderabad, Telangana, India",
			latitude: "17.3850",
			longitude: "78.4867",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-09-11T11:00:00.000Z"),
			endDate: new Date("2026-09-11T19:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.CANCELLED,
			description:
				"Hack night cancelled due to venue scheduling conflict. Kept for cancellation flow testing.",
		},
		create: {
			id: seedIds.events.hackNightCancelled2026,
			name: "Voltaze Hack Night",
			slug: "voltaze-hack-night-2026",
			userId: hostArjunUser.id,
			coverUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
			thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475",
			venueName: "Nexus Hall",
			address: "Hyderabad, Telangana, India",
			latitude: "17.3850",
			longitude: "78.4867",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-09-11T11:00:00.000Z"),
			endDate: new Date("2026-09-11T19:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.CANCELLED,
			description:
				"Hack night cancelled due to venue scheduling conflict. Kept for cancellation flow testing.",
		},
	});

	const launchGeneralTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.launchGeneral },
		update: {
			eventId: launchEvent.id,
			name: "General Admission",
			description: "Access to all keynote sessions and expo floor.",
			price: 149900,
			maxQuantity: 1000,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.launchGeneral,
			eventId: launchEvent.id,
			name: "General Admission",
			description: "Access to all keynote sessions and expo floor.",
			price: 149900,
			maxQuantity: 1000,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
	});

	const launchVipTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.launchVip },
		update: {
			eventId: launchEvent.id,
			name: "VIP Pass",
			description:
				"Priority seating, VIP lounge, and private networking dinner.",
			price: 399900,
			maxQuantity: 200,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.launchVip,
			eventId: launchEvent.id,
			name: "VIP Pass",
			description:
				"Priority seating, VIP lounge, and private networking dinner.",
			price: 399900,
			maxQuantity: 200,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
	});

	const launchBackstageTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.launchBackstage },
		update: {
			eventId: launchEvent.id,
			name: "Backstage Access",
			description: "Limited backstage entry and speaker meet-and-greet.",
			price: 699900,
			maxQuantity: 50,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.launchBackstage,
			eventId: launchEvent.id,
			name: "Backstage Access",
			description: "Limited backstage entry and speaker meet-and-greet.",
			price: 699900,
			maxQuantity: 50,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
	});

	const communityFreeTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.communityFree },
		update: {
			eventId: communityLiveEvent.id,
			name: "Community Access",
			description: "Free livestream access with Q&A chat participation.",
			price: 0,
			maxQuantity: 10000,
			soldCount: 1,
			salesStart: new Date("2026-06-01T00:00:00.000Z"),
			salesEnd: new Date("2026-07-10T12:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.communityFree,
			eventId: communityLiveEvent.id,
			name: "Community Access",
			description: "Free livestream access with Q&A chat participation.",
			price: 0,
			maxQuantity: 10000,
			soldCount: 1,
			salesStart: new Date("2026-06-01T00:00:00.000Z"),
			salesEnd: new Date("2026-07-10T12:59:59.000Z"),
		},
	});

	const foundersEarlyBirdTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.foundersEarlyBird },
		update: {
			eventId: foundersCircleEvent.id,
			name: "Early Bird Invite",
			description:
				"Discounted invite tier before final speaker lineup is announced.",
			price: 9900,
			maxQuantity: 150,
			soldCount: 0,
			salesStart: new Date("2026-07-01T00:00:00.000Z"),
			salesEnd: new Date("2026-08-10T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.foundersEarlyBird,
			eventId: foundersCircleEvent.id,
			name: "Early Bird Invite",
			description:
				"Discounted invite tier before final speaker lineup is announced.",
			price: 9900,
			maxQuantity: 150,
			soldCount: 0,
			salesStart: new Date("2026-07-01T00:00:00.000Z"),
			salesEnd: new Date("2026-08-10T23:59:59.000Z"),
		},
	});

	await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.hackNightGeneral },
		update: {
			eventId: hackNightCancelledEvent.id,
			name: "Hack Night General",
			description: "General access tier for cancelled event flow testing.",
			price: 49900,
			maxQuantity: 500,
			soldCount: 0,
			salesStart: new Date("2026-08-01T00:00:00.000Z"),
			salesEnd: new Date("2026-09-05T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.hackNightGeneral,
			eventId: hackNightCancelledEvent.id,
			name: "Hack Night General",
			description: "General access tier for cancelled event flow testing.",
			price: 49900,
			maxQuantity: 500,
			soldCount: 0,
			salesStart: new Date("2026-08-01T00:00:00.000Z"),
			salesEnd: new Date("2026-09-05T23:59:59.000Z"),
		},
	});

	const launchAvaAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.launchAva },
		update: {
			userId: attendeeAvaUser.id,
			eventId: launchEvent.id,
			name: "Ava Sharma",
			email: attendeeAvaUser.email,
			phone: "+919100000001",
		},
		create: {
			id: seedIds.attendees.launchAva,
			userId: attendeeAvaUser.id,
			eventId: launchEvent.id,
			name: "Ava Sharma",
			email: attendeeAvaUser.email,
			phone: "+919100000001",
		},
	});

	const launchLiamAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.launchLiam },
		update: {
			userId: attendeeLiamUser.id,
			eventId: launchEvent.id,
			name: "Liam Dsouza",
			email: attendeeLiamUser.email,
			phone: "+919100000002",
		},
		create: {
			id: seedIds.attendees.launchLiam,
			userId: attendeeLiamUser.id,
			eventId: launchEvent.id,
			name: "Liam Dsouza",
			email: attendeeLiamUser.email,
			phone: "+919100000002",
		},
	});

	const launchWalkInAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.launchWalkIn },
		update: {
			userId: null,
			eventId: launchEvent.id,
			name: "Walk-in Guest",
			email: "walkin.launch.seed@voltaze.local",
			phone: "+919100000003",
		},
		create: {
			id: seedIds.attendees.launchWalkIn,
			userId: null,
			eventId: launchEvent.id,
			name: "Walk-in Guest",
			email: "walkin.launch.seed@voltaze.local",
			phone: "+919100000003",
		},
	});

	const communityNoahAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.communityNoah },
		update: {
			userId: attendeeNoahUser.id,
			eventId: communityLiveEvent.id,
			name: "Noah Fernandez",
			email: attendeeNoahUser.email,
			phone: "+919100000004",
		},
		create: {
			id: seedIds.attendees.communityNoah,
			userId: attendeeNoahUser.id,
			eventId: communityLiveEvent.id,
			name: "Noah Fernandez",
			email: attendeeNoahUser.email,
			phone: "+919100000004",
		},
	});

	const communityGuestAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.communityGuest },
		update: {
			userId: null,
			eventId: communityLiveEvent.id,
			name: "Guest Viewer",
			email: "guest.community.seed@voltaze.local",
			phone: "+919100000005",
		},
		create: {
			id: seedIds.attendees.communityGuest,
			userId: null,
			eventId: communityLiveEvent.id,
			name: "Guest Viewer",
			email: "guest.community.seed@voltaze.local",
			phone: "+919100000005",
		},
	});

	const foundersAvaAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.foundersAva },
		update: {
			userId: attendeeAvaUser.id,
			eventId: foundersCircleEvent.id,
			name: "Ava Sharma",
			email: "ava.founders.seed@voltaze.local",
			phone: "+919100000006",
		},
		create: {
			id: seedIds.attendees.foundersAva,
			userId: attendeeAvaUser.id,
			eventId: foundersCircleEvent.id,
			name: "Ava Sharma",
			email: "ava.founders.seed@voltaze.local",
			phone: "+919100000006",
		},
	});

	const launchAvaOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.launchAvaCompleted },
		update: {
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.launchAvaCompleted,
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const launchLiamOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.launchLiamCompleted },
		update: {
			attendeeId: launchLiamAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.launchLiamCompleted,
			attendeeId: launchLiamAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const launchWalkInOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.launchWalkInCancelled },
		update: {
			attendeeId: launchWalkInAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.CANCELLED,
			deletedAt: seededAt,
		},
		create: {
			id: seedIds.orders.launchWalkInCancelled,
			attendeeId: launchWalkInAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.CANCELLED,
			deletedAt: seededAt,
		},
	});

	const communityNoahOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.communityNoahCompleted },
		update: {
			attendeeId: communityNoahAttendee.id,
			eventId: communityLiveEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.communityNoahCompleted,
			attendeeId: communityNoahAttendee.id,
			eventId: communityLiveEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	await prisma.order.upsert({
		where: { id: seedIds.orders.communityGuestPending },
		update: {
			attendeeId: communityGuestAttendee.id,
			eventId: communityLiveEvent.id,
			status: OrderStatus.PENDING,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.communityGuestPending,
			attendeeId: communityGuestAttendee.id,
			eventId: communityLiveEvent.id,
			status: OrderStatus.PENDING,
		},
	});

	const foundersAvaOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.foundersAvaPending },
		update: {
			attendeeId: foundersAvaAttendee.id,
			eventId: foundersCircleEvent.id,
			status: OrderStatus.PENDING,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.foundersAvaPending,
			attendeeId: foundersAvaAttendee.id,
			eventId: foundersCircleEvent.id,
			status: OrderStatus.PENDING,
		},
	});

	const launchAvaTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.launchAvaGeneral },
		update: {
			orderId: launchAvaOrder.id,
			eventId: launchEvent.id,
			tierId: launchGeneralTier.id,
			pricePaid: launchGeneralTier.price,
		},
		create: {
			id: seedIds.tickets.launchAvaGeneral,
			orderId: launchAvaOrder.id,
			eventId: launchEvent.id,
			tierId: launchGeneralTier.id,
			pricePaid: launchGeneralTier.price,
		},
	});

	const launchLiamTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.launchLiamVip },
		update: {
			orderId: launchLiamOrder.id,
			eventId: launchEvent.id,
			tierId: launchVipTier.id,
			pricePaid: launchVipTier.price,
		},
		create: {
			id: seedIds.tickets.launchLiamVip,
			orderId: launchLiamOrder.id,
			eventId: launchEvent.id,
			tierId: launchVipTier.id,
			pricePaid: launchVipTier.price,
		},
	});

	const launchWalkInTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.launchWalkInBackstage },
		update: {
			orderId: launchWalkInOrder.id,
			eventId: launchEvent.id,
			tierId: launchBackstageTier.id,
			pricePaid: launchBackstageTier.price,
		},
		create: {
			id: seedIds.tickets.launchWalkInBackstage,
			orderId: launchWalkInOrder.id,
			eventId: launchEvent.id,
			tierId: launchBackstageTier.id,
			pricePaid: launchBackstageTier.price,
		},
	});

	const communityNoahTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.communityNoahFree },
		update: {
			orderId: communityNoahOrder.id,
			eventId: communityLiveEvent.id,
			tierId: communityFreeTier.id,
			pricePaid: communityFreeTier.price,
		},
		create: {
			id: seedIds.tickets.communityNoahFree,
			orderId: communityNoahOrder.id,
			eventId: communityLiveEvent.id,
			tierId: communityFreeTier.id,
			pricePaid: communityFreeTier.price,
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.launchAvaActive },
		update: {
			eventId: launchEvent.id,
			attendeeId: launchAvaAttendee.id,
			ticketId: launchAvaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SEED-PASS-LAUNCH-AVA",
		},
		create: {
			id: seedIds.passes.launchAvaActive,
			eventId: launchEvent.id,
			attendeeId: launchAvaAttendee.id,
			ticketId: launchAvaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SEED-PASS-LAUNCH-AVA",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.launchLiamUsed },
		update: {
			eventId: launchEvent.id,
			attendeeId: launchLiamAttendee.id,
			ticketId: launchLiamTicket.id,
			type: PassType.VIP,
			status: PassStatus.USED,
			code: "VTZ-SEED-PASS-LAUNCH-LIAM",
		},
		create: {
			id: seedIds.passes.launchLiamUsed,
			eventId: launchEvent.id,
			attendeeId: launchLiamAttendee.id,
			ticketId: launchLiamTicket.id,
			type: PassType.VIP,
			status: PassStatus.USED,
			code: "VTZ-SEED-PASS-LAUNCH-LIAM",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.launchWalkInCancelled },
		update: {
			eventId: launchEvent.id,
			attendeeId: launchWalkInAttendee.id,
			ticketId: launchWalkInTicket.id,
			type: PassType.BACKSTAGE,
			status: PassStatus.CANCELLED,
			code: "VTZ-SEED-PASS-LAUNCH-WALKIN",
		},
		create: {
			id: seedIds.passes.launchWalkInCancelled,
			eventId: launchEvent.id,
			attendeeId: launchWalkInAttendee.id,
			ticketId: launchWalkInTicket.id,
			type: PassType.BACKSTAGE,
			status: PassStatus.CANCELLED,
			code: "VTZ-SEED-PASS-LAUNCH-WALKIN",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.communityNoahUsed },
		update: {
			eventId: communityLiveEvent.id,
			attendeeId: communityNoahAttendee.id,
			ticketId: communityNoahTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.USED,
			code: "VTZ-SEED-PASS-COMMUNITY-NOAH",
		},
		create: {
			id: seedIds.passes.communityNoahUsed,
			eventId: communityLiveEvent.id,
			attendeeId: communityNoahAttendee.id,
			ticketId: communityNoahTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.USED,
			code: "VTZ-SEED-PASS-COMMUNITY-NOAH",
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.launchAvaSuccess },
		update: {
			orderId: launchAvaOrder.id,
			amount: launchGeneralTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_ava_success",
			gatewayMeta: {
				scenario: "paid-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.launchAvaSuccess,
			orderId: launchAvaOrder.id,
			amount: launchGeneralTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_ava_success",
			gatewayMeta: {
				scenario: "paid-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.launchLiamSuccess },
		update: {
			orderId: launchLiamOrder.id,
			amount: launchVipTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_liam_success",
			gatewayMeta: {
				scenario: "vip-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.launchLiamSuccess,
			orderId: launchLiamOrder.id,
			amount: launchVipTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_liam_success",
			gatewayMeta: {
				scenario: "vip-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.launchWalkInRefunded },
		update: {
			orderId: launchWalkInOrder.id,
			amount: launchBackstageTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_walkin_refunded",
			gatewayMeta: {
				scenario: "cancelled-order-refund",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.REFUNDED,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.launchWalkInRefunded,
			orderId: launchWalkInOrder.id,
			amount: launchBackstageTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_walkin_refunded",
			gatewayMeta: {
				scenario: "cancelled-order-refund",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.REFUNDED,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.foundersAvaPending },
		update: {
			orderId: foundersAvaOrder.id,
			amount: foundersEarlyBirdTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_founders_ava_pending",
			gatewayMeta: {
				scenario: "draft-event-pending-payment",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.PENDING,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.foundersAvaPending,
			orderId: foundersAvaOrder.id,
			amount: foundersEarlyBirdTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_founders_ava_pending",
			gatewayMeta: {
				scenario: "draft-event-pending-payment",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.PENDING,
		},
	});

	await prisma.checkIn.upsert({
		where: { id: seedIds.checkIns.launchLiam },
		update: {
			attendeeId: launchLiamAttendee.id,
			eventId: launchEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-06-15T11:10:00.000Z"),
		},
		create: {
			id: seedIds.checkIns.launchLiam,
			attendeeId: launchLiamAttendee.id,
			eventId: launchEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-06-15T11:10:00.000Z"),
		},
	});

	await prisma.checkIn.upsert({
		where: { id: seedIds.checkIns.communityNoah },
		update: {
			attendeeId: communityNoahAttendee.id,
			eventId: communityLiveEvent.id,
			method: CheckInMethod.MANUAL,
			timestamp: new Date("2026-07-10T13:10:00.000Z"),
		},
		create: {
			id: seedIds.checkIns.communityNoah,
			attendeeId: communityNoahAttendee.id,
			eventId: communityLiveEvent.id,
			method: CheckInMethod.MANUAL,
			timestamp: new Date("2026-07-10T13:10:00.000Z"),
		},
	});

	const summary = await collectDetailedCoverageSummary();

	return {
		adminEmail: adminUser.email,
		primaryEventSlug: launchEvent.slug,
		primaryEventId: launchEvent.id,
		primaryTierId: launchGeneralTier.id,
		summary,
	};
}

function logDetailedSeedResult(
	label: string,
	result: DetailedSeedResult,
): void {
	console.log(
		`Seed completed successfully. Mode: ${label}. Loaded env from: ${resolvedEnvPath ?? "process environment"}`,
	);
	console.log("Seed coverage:", result.summary);
	console.log(`Admin login email: ${result.adminEmail}`);
	console.log(`Primary event slug: ${result.primaryEventSlug}`);
}

async function seedMinimal(): Promise<void> {
	const seededAt = new Date("2026-03-30T09:00:00.000Z");

	const adminUser = await prisma.user.upsert({
		where: { id: seedIds.users.admin },
		update: {
			name: "Voltaze Admin",
			email: "admin.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
			role: UserRole.ADMIN,
		},
		create: {
			id: seedIds.users.admin,
			name: "Voltaze Admin",
			email: "admin.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
			role: UserRole.ADMIN,
		},
	});

	const hostPriyaUser = await prisma.user.upsert({
		where: { id: seedIds.users.hostPriya },
		update: {
			name: "Priya Nair",
			email: "priya.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
		create: {
			id: seedIds.users.hostPriya,
			name: "Priya Nair",
			email: "priya.host.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
	});

	const attendeeAvaUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeAva },
		update: {
			name: "Ava Sharma",
			email: "ava.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeAva,
			name: "Ava Sharma",
			email: "ava.seed@voltaze.local",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.USER,
		},
	});

	const launchEvent = await prisma.event.upsert({
		where: { id: seedIds.events.launch2026 },
		update: {
			name: "Voltaze Launch 2026",
			slug: "voltaze-launch-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7",
			venueName: "Voltaze Arena",
			address: "Bengaluru, Karnataka, India",
			latitude: "12.9716",
			longitude: "77.5946",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-06-15T10:00:00.000Z"),
			endDate: new Date("2026-06-15T18:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Official Voltaze launch with keynote sessions, product demos, and partner showcases.",
		},
		create: {
			id: seedIds.events.launch2026,
			name: "Voltaze Launch 2026",
			slug: "voltaze-launch-2026",
			userId: hostPriyaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7",
			venueName: "Voltaze Arena",
			address: "Bengaluru, Karnataka, India",
			latitude: "12.9716",
			longitude: "77.5946",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-06-15T10:00:00.000Z"),
			endDate: new Date("2026-06-15T18:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Official Voltaze launch with keynote sessions, product demos, and partner showcases.",
		},
	});

	const launchGeneralTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.launchGeneral },
		update: {
			eventId: launchEvent.id,
			name: "General Admission",
			description: "Access to all keynote sessions and expo floor.",
			price: 149900,
			maxQuantity: 1000,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
		create: {
			id: seedIds.tiers.launchGeneral,
			eventId: launchEvent.id,
			name: "General Admission",
			description: "Access to all keynote sessions and expo floor.",
			price: 149900,
			maxQuantity: 1000,
			soldCount: 1,
			salesStart: new Date("2026-05-01T00:00:00.000Z"),
			salesEnd: new Date("2026-06-14T23:59:59.000Z"),
		},
	});

	const launchAvaAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.launchAva },
		update: {
			userId: attendeeAvaUser.id,
			eventId: launchEvent.id,
			name: "Ava Sharma",
			email: attendeeAvaUser.email,
			phone: "+919100000001",
		},
		create: {
			id: seedIds.attendees.launchAva,
			userId: attendeeAvaUser.id,
			eventId: launchEvent.id,
			name: "Ava Sharma",
			email: attendeeAvaUser.email,
			phone: "+919100000001",
		},
	});

	const launchAvaOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.launchAvaCompleted },
		update: {
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.launchAvaCompleted,
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const launchAvaTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.launchAvaGeneral },
		update: {
			orderId: launchAvaOrder.id,
			eventId: launchEvent.id,
			tierId: launchGeneralTier.id,
			pricePaid: launchGeneralTier.price,
		},
		create: {
			id: seedIds.tickets.launchAvaGeneral,
			orderId: launchAvaOrder.id,
			eventId: launchEvent.id,
			tierId: launchGeneralTier.id,
			pricePaid: launchGeneralTier.price,
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.launchAvaActive },
		update: {
			eventId: launchEvent.id,
			attendeeId: launchAvaAttendee.id,
			ticketId: launchAvaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SEED-PASS-LAUNCH-AVA",
		},
		create: {
			id: seedIds.passes.launchAvaActive,
			eventId: launchEvent.id,
			attendeeId: launchAvaAttendee.id,
			ticketId: launchAvaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SEED-PASS-LAUNCH-AVA",
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.launchAvaSuccess },
		update: {
			orderId: launchAvaOrder.id,
			amount: launchGeneralTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_ava_success",
			gatewayMeta: {
				scenario: "minimal-paid-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.launchAvaSuccess,
			orderId: launchAvaOrder.id,
			amount: launchGeneralTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_launch_ava_success",
			gatewayMeta: {
				scenario: "minimal-paid-order-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.checkIn.upsert({
		where: { id: "seed_checkin_launch_ava_minimal" },
		update: {
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-06-15T10:45:00.000Z"),
		},
		create: {
			id: "seed_checkin_launch_ava_minimal",
			attendeeId: launchAvaAttendee.id,
			eventId: launchEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-06-15T10:45:00.000Z"),
		},
	});

	const summary = {
		users: await prisma.user.count({
			where: {
				id: {
					in: [
						seedIds.users.admin,
						seedIds.users.hostPriya,
						seedIds.users.attendeeAva,
					],
				},
			},
		}),
		events: await prisma.event.count({
			where: { id: { in: [seedIds.events.launch2026] } },
		}),
		tiers: await prisma.ticketTier.count({
			where: { id: { in: [seedIds.tiers.launchGeneral] } },
		}),
		attendees: await prisma.attendee.count({
			where: { id: { in: [seedIds.attendees.launchAva] } },
		}),
		orders: await prisma.order.count({
			where: { id: { in: [seedIds.orders.launchAvaCompleted] } },
		}),
		tickets: await prisma.ticket.count({
			where: { id: { in: [seedIds.tickets.launchAvaGeneral] } },
		}),
		passes: await prisma.pass.count({
			where: { id: { in: [seedIds.passes.launchAvaActive] } },
		}),
		payments: await prisma.payment.count({
			where: { id: { in: [seedIds.payments.launchAvaSuccess] } },
		}),
		checkIns: await prisma.checkIn.count({
			where: { id: "seed_checkin_launch_ava_minimal" },
		}),
	};

	console.log(
		`Seed completed successfully. Mode: minimal. Loaded env from: ${resolvedEnvPath ?? "process environment"}`,
	);
	console.log("Seed coverage:", summary);
	console.log(`Admin login email: ${adminUser.email}`);
	console.log(`Primary event slug: ${launchEvent.slug}`);
}

async function seedLargeDemo(): Promise<void> {
	const baseResult = await seedDetailed();
	const largeCount = parseLargeDemoCount();
	const seededAt = new Date("2026-03-30T09:30:00.000Z");

	let usedPassesCreated = 0;

	for (let index = 1; index <= largeCount; index += 1) {
		const suffix = String(index).padStart(4, "0");
		const fullName = `Large Demo User ${suffix}`;
		const email = `large.demo.${suffix}@voltaze.local`;
		const phone = `+919300${String(index).padStart(6, "0")}`;

		const user = await prisma.user.upsert({
			where: { id: `seed_user_large_${suffix}` },
			update: {
				name: fullName,
				email,
				emailVerified: index % 6 !== 0,
				role: UserRole.USER,
			},
			create: {
				id: `seed_user_large_${suffix}`,
				name: fullName,
				email,
				emailVerified: index % 6 !== 0,
				role: UserRole.USER,
			},
		});

		const attendee = await prisma.attendee.upsert({
			where: { id: `seed_attendee_large_${suffix}` },
			update: {
				userId: user.id,
				eventId: baseResult.primaryEventId,
				name: fullName,
				email,
				phone,
			},
			create: {
				id: `seed_attendee_large_${suffix}`,
				userId: user.id,
				eventId: baseResult.primaryEventId,
				name: fullName,
				email,
				phone,
			},
		});

		const orderStatus =
			index % 15 === 0
				? OrderStatus.CANCELLED
				: index % 4 === 0
					? OrderStatus.PENDING
					: OrderStatus.COMPLETED;

		const order = await prisma.order.upsert({
			where: { id: `seed_order_large_${suffix}` },
			update: {
				attendeeId: attendee.id,
				eventId: baseResult.primaryEventId,
				status: orderStatus,
				deletedAt: orderStatus === OrderStatus.CANCELLED ? seededAt : null,
			},
			create: {
				id: `seed_order_large_${suffix}`,
				attendeeId: attendee.id,
				eventId: baseResult.primaryEventId,
				status: orderStatus,
				deletedAt: orderStatus === OrderStatus.CANCELLED ? seededAt : null,
			},
		});

		const ticket = await prisma.ticket.upsert({
			where: { id: `seed_ticket_large_${suffix}` },
			update: {
				orderId: order.id,
				eventId: baseResult.primaryEventId,
				tierId: baseResult.primaryTierId,
				pricePaid: 149900,
			},
			create: {
				id: `seed_ticket_large_${suffix}`,
				orderId: order.id,
				eventId: baseResult.primaryEventId,
				tierId: baseResult.primaryTierId,
				pricePaid: 149900,
			},
		});

		if (orderStatus !== OrderStatus.PENDING) {
			const passStatus =
				orderStatus === OrderStatus.CANCELLED
					? PassStatus.CANCELLED
					: index % 3 === 0
						? PassStatus.USED
						: PassStatus.ACTIVE;

			await prisma.pass.upsert({
				where: { id: `seed_pass_large_${suffix}` },
				update: {
					eventId: baseResult.primaryEventId,
					attendeeId: attendee.id,
					ticketId: ticket.id,
					type: PassType.GENERAL,
					status: passStatus,
					code: `VTZ-LARGE-PASS-${suffix}`,
				},
				create: {
					id: `seed_pass_large_${suffix}`,
					eventId: baseResult.primaryEventId,
					attendeeId: attendee.id,
					ticketId: ticket.id,
					type: PassType.GENERAL,
					status: passStatus,
					code: `VTZ-LARGE-PASS-${suffix}`,
				},
			});

			if (passStatus === PassStatus.USED) {
				usedPassesCreated += 1;

				await prisma.checkIn.upsert({
					where: { id: `seed_checkin_large_${suffix}` },
					update: {
						attendeeId: attendee.id,
						eventId: baseResult.primaryEventId,
						method:
							index % 2 === 0 ? CheckInMethod.QR_SCAN : CheckInMethod.MANUAL,
						timestamp: new Date(
							`2026-06-15T${String(10 + (index % 8)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}:00.000Z`,
						),
					},
					create: {
						id: `seed_checkin_large_${suffix}`,
						attendeeId: attendee.id,
						eventId: baseResult.primaryEventId,
						method:
							index % 2 === 0 ? CheckInMethod.QR_SCAN : CheckInMethod.MANUAL,
						timestamp: new Date(
							`2026-06-15T${String(10 + (index % 8)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}:00.000Z`,
						),
					},
				});
			}
		}

		const paymentStatus =
			orderStatus === OrderStatus.CANCELLED
				? PaymentStatus.REFUNDED
				: orderStatus === OrderStatus.PENDING
					? PaymentStatus.PENDING
					: PaymentStatus.SUCCESS;

		await prisma.payment.upsert({
			where: { id: `seed_payment_large_${suffix}` },
			update: {
				orderId: order.id,
				amount: 149900,
				currency: "INR",
				gateway: PaymentGateway.RAZORPAY,
				transactionId: `seed_txn_large_${suffix}`,
				gatewayMeta: {
					scenario: "large-demo-order",
					orderStatus,
					seededAt: seededAt.toISOString(),
				},
				status: paymentStatus,
				deletedAt: null,
			},
			create: {
				id: `seed_payment_large_${suffix}`,
				orderId: order.id,
				amount: 149900,
				currency: "INR",
				gateway: PaymentGateway.RAZORPAY,
				transactionId: `seed_txn_large_${suffix}`,
				gatewayMeta: {
					scenario: "large-demo-order",
					orderStatus,
					seededAt: seededAt.toISOString(),
				},
				status: paymentStatus,
			},
		});

		if (index % 50 === 0 || index === largeCount) {
			console.log(`Large demo progress: ${index}/${largeCount}`);
		}
	}

	const refreshedTierSoldCount = await prisma.ticket.count({
		where: { tierId: baseResult.primaryTierId },
	});

	await prisma.ticketTier.update({
		where: { id: baseResult.primaryTierId },
		data: { soldCount: refreshedTierSoldCount },
	});

	const largeSummary = {
		generatedUsers: await prisma.user.count({
			where: { id: { startsWith: "seed_user_large_" } },
		}),
		generatedAttendees: await prisma.attendee.count({
			where: { id: { startsWith: "seed_attendee_large_" } },
		}),
		generatedOrders: await prisma.order.count({
			where: { id: { startsWith: "seed_order_large_" } },
		}),
		generatedTickets: await prisma.ticket.count({
			where: { id: { startsWith: "seed_ticket_large_" } },
		}),
		generatedPasses: await prisma.pass.count({
			where: { id: { startsWith: "seed_pass_large_" } },
		}),
		generatedPayments: await prisma.payment.count({
			where: { id: { startsWith: "seed_payment_large_" } },
		}),
		generatedCheckIns: await prisma.checkIn.count({
			where: { id: { startsWith: "seed_checkin_large_" } },
		}),
		usedPassesCreated,
		refreshedPrimaryTierSoldCount: refreshedTierSoldCount,
	};

	const combinedSummary = await collectDetailedCoverageSummary();

	console.log(
		`Seed completed successfully. Mode: large-demo. Loaded env from: ${resolvedEnvPath ?? "process environment"}`,
	);
	console.log("Base seed coverage:", combinedSummary);
	console.log("Large demo coverage:", largeSummary);
	console.log(`Admin login email: ${baseResult.adminEmail}`);
	console.log(`Primary event slug: ${baseResult.primaryEventSlug}`);
}

async function runSeedByMode(): Promise<void> {
	const mode = parseSeedMode();

	if (mode === "minimal") {
		await seedMinimal();
		return;
	}

	if (mode === "large-demo") {
		await seedLargeDemo();
		return;
	}

	const result = await seedDetailed();
	logDetailedSeedResult("detailed", result);
}

runSeedByMode()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
