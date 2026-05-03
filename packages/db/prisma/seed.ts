import {
	CheckInMethod,
	EventMode,
	EventStatus,
	EventType,
	EventVisibility,
	NotificationStatus,
	NotificationType,
	OrderStatus,
	PassStatus,
	PaymentGateway,
	PaymentStatus,
	UserRole,
} from "../prisma/generated/client";
import { prisma } from "../src/index";

type CreateOrderInput = {
	attendeeId: string;
	eventId: string;
	tierId: string;
	quantity: number;
	status: OrderStatus;
	passStatus: PassStatus;
	paymentStatus: PaymentStatus;
	transactionId?: string;
	checkIn?: boolean;
};

const scryptConfig = {
	N: 16384,
	r: 16,
	p: 1,
	dkLen: 64,
};

const hashPassword = async (password: string) => {
	const { scrypt, randomBytes } = await import("node:crypto");
	const salt = randomBytes(16).toString("hex");

	return new Promise<string>((resolve, reject) => {
		scrypt(
			password.normalize("NFKC"),
			salt,
			scryptConfig.dkLen,
			{
				N: scryptConfig.N,
				r: scryptConfig.r,
				p: scryptConfig.p,
				maxmem: 128 * scryptConfig.N * scryptConfig.r * 2,
			},
			(err, key) => {
				if (err) reject(err);
				else resolve(`${salt}:${key.toString("hex")}`);
			},
		);
	});
};

async function main() {
	console.log("🌱 Starting seeding...");

	console.log("Cleaning database...");
	await prisma.notification.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.pass.deleteMany();
	await prisma.checkIn.deleteMany();
	await prisma.ticket.deleteMany();
	await prisma.order.deleteMany();
	await prisma.attendee.deleteMany();
	await prisma.ticketTier.deleteMany();
	await prisma.event.deleteMany();
	await prisma.verification.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();

	console.log("Creating users and auth records...");
	const admin = await prisma.user.create({
		data: {
			name: "Platform Admin",
			email: "admin@univents.com",
			role: UserRole.ADMIN,
			isHost: true,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
		},
	});

	const hostA = await prisma.user.create({
		data: {
			name: "Nayan Biswas",
			email: "nayan@univents.com",
			role: UserRole.USER,
			isHost: true,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=nayan",
		},
	});

	const hostB = await prisma.user.create({
		data: {
			name: "Amina Khan",
			email: "amina@univents.com",
			role: UserRole.USER,
			isHost: true,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=amina",
		},
	});

	const attendeeUserA = await prisma.user.create({
		data: {
			name: "John Doe",
			email: "john@example.com",
			role: UserRole.USER,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
		},
	});

	const attendeeUserB = await prisma.user.create({
		data: {
			name: "Sara Iyer",
			email: "sara@example.com",
			role: UserRole.USER,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
		},
	});

	const hashedPassword = await hashPassword("password123");
	for (const user of [admin, hostA, hostB, attendeeUserA, attendeeUserB]) {
		await prisma.account.create({
			data: {
				userId: user.id,
				accountId: user.email,
				providerId: "credential",
				password: hashedPassword,
			},
		});
	}

	await prisma.account.create({
		data: {
			userId: hostA.id,
			accountId: "google-oauth2|nayan-001",
			providerId: "google",
			accessToken: "seed_google_access_token",
			scope: "openid profile email",
			accessTokenExpiresAt: new Date("2026-12-31T00:00:00Z"),
		},
	});

	await prisma.session.createMany({
		data: [
			{
				userId: admin.id,
				expiresAt: new Date("2026-12-01T00:00:00Z"),
				token: "seed_session_admin_token",
				ipAddress: "127.0.0.1",
				userAgent: "SeedAgent/1.0",
			},
			{
				userId: hostA.id,
				expiresAt: new Date("2026-11-01T00:00:00Z"),
				token: "seed_session_host_token",
				ipAddress: "10.0.0.5",
				userAgent: "Chrome/124",
			},
		],
	});

	await prisma.verification.createMany({
		data: [
			{
				id: "verify_admin_email",
				identifier: admin.email,
				value: "654321",
				expiresAt: new Date("2026-12-31T00:00:00Z"),
			},
			{
				id: "verify_guest_phone",
				identifier: "+919999999999",
				value: "112233",
				expiresAt: new Date("2026-06-01T00:00:00Z"),
			},
		],
	});

	console.log("Creating events and ticket tiers...");
	const techSummit = await prisma.event.create({
		data: {
			name: "Global Tech Summit 2026",
			slug: "global-tech-summit-2026",
			userId: hostA.id,
			coverUrl:
				"https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=400",
			description:
				"Join industry leaders for the most influential tech event of the year. Deep dives into AI, Quantum Computing, and the future of the Web.",
			venueName: "Convention Center",
			address: "123 Tech Park, Bangalore, India",
			latitude: "12.9716",
			longitude: "77.5946",
			startDate: new Date("2026-06-15T09:00:00Z"),
			endDate: new Date("2026-06-17T18:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			isApproved: true,
			timezone: "Asia/Kolkata",
		},
	});

	const neonNights = await prisma.event.create({
		data: {
			name: "Neon Nights Music Festival",
			slug: "neon-nights-2026",
			userId: hostA.id,
			coverUrl:
				"https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=400",
			description:
				"An immersive music experience featuring the best electronic and synthwave artists from across the globe.",
			venueName: "Open Air Stadium",
			address: "Marine Drive, Mumbai, India",
			latitude: "18.9431",
			longitude: "72.8230",
			startDate: new Date("2026-07-20T17:00:00Z"),
			endDate: new Date("2026-07-21T02:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.CANCELLED,
			isApproved: true,
			timezone: "Asia/Kolkata",
		},
	});

	const prismaWorkshop = await prisma.event.create({
		data: {
			name: "Mastering Prisma Workshop",
			slug: "mastering-prisma-2026",
			userId: admin.id,
			coverUrl:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400",
			description:
				"A comprehensive online workshop to master database modeling and type-safe queries with Prisma.",
			startDate: new Date("2026-05-10T14:00:00Z"),
			endDate: new Date("2026-05-10T17:00:00Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.COMPLETED,
			isApproved: true,
			timezone: "UTC",
		},
	});

	const designMeetup = await prisma.event.create({
		data: {
			name: "Design Systems Roundtable",
			slug: "design-systems-roundtable-2026",
			userId: hostB.id,
			coverUrl:
				"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070",
			description:
				"A private invite-only draft event for design leads to review system governance and accessibility strategy.",
			startDate: new Date("2026-08-08T10:00:00Z"),
			endDate: new Date("2026-08-08T13:00:00Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PRIVATE,
			status: EventStatus.DRAFT,
			isApproved: false,
			timezone: "Asia/Kolkata",
		},
	});

	const hackathon = await prisma.event.create({
		data: {
			name: "Campus Buildathon 2026",
			slug: "campus-buildathon-2026",
			userId: hostB.id,
			coverUrl:
				"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400",
			description:
				"48-hour student hackathon with mentorship tracks and sponsor challenges.",
			venueName: "IIT Bangalore Campus",
			address: "Yelahanka, Bangalore, India",
			latitude: "13.0352",
			longitude: "77.5669",
			startDate: new Date("2026-09-11T03:30:00Z"),
			endDate: new Date("2026-09-13T15:30:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			isApproved: true,
			timezone: "Asia/Kolkata",
		},
	});

	const comedyNight = await prisma.event.create({
		data: {
			name: "Laugh Out Loud: Comedy Night",
			slug: "lol-comedy-night",
			userId: hostA.id,
			coverUrl:
				"https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400",
			description:
				"Get ready for a night of rib-tickling laughter with some of the best stand-up comedians in the country.",
			venueName: "The Laugh Club",
			address: "Indiranagar, Bangalore, India",
			startDate: new Date("2026-05-25T19:30:00Z"),
			endDate: new Date("2026-05-25T22:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			isApproved: true,
			timezone: "Asia/Kolkata",
		},
	});

	const aiSummit = await prisma.event.create({
		data: {
			name: "Generative AI Summit",
			slug: "gen-ai-summit-2026",
			userId: admin.id,
			coverUrl:
				"https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400",
			description:
				"Exploring the latest breakthroughs in Generative AI and LLMs. Keynotes from leading researchers and engineers.",
			venueName: "Grand Ballroom, Tech Hotel",
			address: "Cyber City, Hyderabad, India",
			startDate: new Date("2026-08-20T10:00:00Z"),
			endDate: new Date("2026-08-21T17:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			isApproved: true,
			timezone: "Asia/Kolkata",
		},
	});

	const techTiers = await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: techSummit.id,
				name: "General Admission",
				description: "Full access to all keynote sessions and exhibition area.",
				price: 299900,
				quantity: 500,
				salesStart: new Date("2026-02-01T00:00:00Z"),
				salesEnd: new Date("2026-06-14T18:00:00Z"),
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: techSummit.id,
				name: "VIP Pass",
				description:
					"Priority seating, exclusive lounge access, and dinner with speakers.",
				price: 799900,
				quantity: 50,
				salesStart: new Date("2026-02-01T00:00:00Z"),
				salesEnd: new Date("2026-06-12T18:00:00Z"),
			},
		}),
	]);

	const neonTiers = await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: neonNights.id,
				name: "Early Bird",
				description: "Discounted entry for early supporters.",
				price: 99900,
				quantity: 200,
				salesStart: new Date("2026-03-01T00:00:00Z"),
				salesEnd: new Date("2026-04-15T00:00:00Z"),
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: neonNights.id,
				name: "Regular Entry",
				description: "Standard entry pass.",
				price: 199900,
				quantity: 1000,
				salesStart: new Date("2026-04-16T00:00:00Z"),
				salesEnd: new Date("2026-07-20T12:00:00Z"),
			},
		}),
	]);

	const workshopTier = await prisma.ticketTier.create({
		data: {
			eventId: prismaWorkshop.id,
			name: "Free Registration",
			description: "Join the live stream and get access to recording.",
			price: 0,
			quantity: 5000,
			salesStart: new Date("2026-01-01T00:00:00Z"),
			salesEnd: new Date("2026-05-10T13:45:00Z"),
		},
	});

	const hackathonTiers = await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: hackathon.id,
				name: "Participant",
				description: "Team participant entry with coding arena access.",
				price: 49900,
				quantity: 800,
				salesStart: new Date("2026-04-01T00:00:00Z"),
				salesEnd: new Date("2026-09-10T23:59:00Z"),
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: hackathon.id,
				name: "Mentor",
				description: "Mentor pass with jury and breakout lounge access.",
				price: 0,
				quantity: 120,
				salesStart: new Date("2026-04-01T00:00:00Z"),
				salesEnd: new Date("2026-09-10T23:59:00Z"),
			},
		}),
	]);

	await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: comedyNight.id,
				name: "Front Row",
				price: 149900,
				quantity: 50,
				salesStart: new Date("2026-04-01T00:00:00Z"),
				salesEnd: new Date("2026-05-25T18:00:00Z"),
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: comedyNight.id,
				name: "General Admission",
				price: 79900,
				quantity: 150,
				salesStart: new Date("2026-04-01T00:00:00Z"),
				salesEnd: new Date("2026-05-25T19:00:00Z"),
			},
		}),
	]);

	await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: aiSummit.id,
				name: "Delegate Pass",
				price: 499900,
				quantity: 300,
				salesStart: new Date("2026-05-01T00:00:00Z"),
				salesEnd: new Date("2026-08-19T18:00:00Z"),
			},
		}),
	]);

	console.log(
		"Creating attendees, orders, tickets, passes, check-ins and payments...",
	);
	const attendees = {
		johnTech: await prisma.attendee.create({
			data: {
				userId: attendeeUserA.id,
				eventId: techSummit.id,
				name: attendeeUserA.name ?? "John Doe",
				email: attendeeUserA.email,
				phone: "9876543210",
			},
		}),
		saraTech: await prisma.attendee.create({
			data: {
				userId: attendeeUserB.id,
				eventId: techSummit.id,
				name: attendeeUserB.name ?? "Sara Iyer",
				email: attendeeUserB.email,
				phone: "9898989898",
			},
		}),
		janeNeon: await prisma.attendee.create({
			data: {
				eventId: neonNights.id,
				name: "Jane Smith",
				email: "jane@example.com",
				phone: "9000012345",
			},
		}),
		alexWorkshop: await prisma.attendee.create({
			data: {
				eventId: prismaWorkshop.id,
				name: "Alex Martin",
				email: "alex@example.com",
			},
		}),
		miraHackathon: await prisma.attendee.create({
			data: {
				eventId: hackathon.id,
				name: "Mira Das",
				email: "mira@example.com",
				phone: "9000076543",
			},
		}),
	};

	const createOrderFlow = async (input: CreateOrderInput) => {
		const tier = await prisma.ticketTier.findUniqueOrThrow({
			where: { id: input.tierId },
		});

		const order = await prisma.order.create({
			data: {
				attendeeId: input.attendeeId,
				eventId: input.eventId,
				status: input.status,
				totalAmount: tier.price * input.quantity,
			},
		});

		for (let i = 0; i < input.quantity; i += 1) {
			const ticket = await prisma.ticket.create({
				data: {
					orderId: order.id,
					eventId: input.eventId,
					tierId: input.tierId,
					pricePaid: tier.price,
				},
			});

			await prisma.pass.create({
				data: {
					eventId: input.eventId,
					attendeeId: input.attendeeId,
					ticketId: ticket.id,
					code: `UE-${input.eventId.slice(-5)}-${ticket.id.slice(-5)}-${i + 1}`,
					status: input.passStatus,
				},
			});
		}

		await prisma.payment.create({
			data: {
				orderId: order.id,
				amount: tier.price * input.quantity,
				currency: "INR",
				gateway: PaymentGateway.RAZORPAY,
				transactionId: input.transactionId,
				status: input.paymentStatus,
				gatewayMeta: {
					seeded: true,
					status: input.paymentStatus,
					quantity: input.quantity,
				},
			},
		});

		if (input.checkIn) {
			await prisma.checkIn.create({
				data: {
					attendeeId: input.attendeeId,
					eventId: input.eventId,
					method: CheckInMethod.QR_SCAN,
				},
			});
		}

		return { order };
	};

	const techOrder1 = await createOrderFlow({
		attendeeId: attendees.johnTech.id,
		eventId: techSummit.id,
		tierId: techTiers[0].id,
		quantity: 2,
		status: OrderStatus.COMPLETED,
		passStatus: PassStatus.USED,
		paymentStatus: PaymentStatus.SUCCESS,
		transactionId: "pay_tech_success_001",
		checkIn: true,
	});

	const techOrder2 = await createOrderFlow({
		attendeeId: attendees.saraTech.id,
		eventId: techSummit.id,
		tierId: techTiers[1].id,
		quantity: 1,
		status: OrderStatus.PENDING,
		passStatus: PassStatus.ACTIVE,
		paymentStatus: PaymentStatus.PENDING,
		transactionId: "pay_tech_pending_001",
	});

	const neonOrder = await createOrderFlow({
		attendeeId: attendees.janeNeon.id,
		eventId: neonNights.id,
		tierId: neonTiers[0].id,
		quantity: 1,
		status: OrderStatus.CANCELLED,
		passStatus: PassStatus.CANCELLED,
		paymentStatus: PaymentStatus.REFUNDED,
		transactionId: "pay_neon_refund_001",
	});

	const workshopOrder = await createOrderFlow({
		attendeeId: attendees.alexWorkshop.id,
		eventId: prismaWorkshop.id,
		tierId: workshopTier.id,
		quantity: 1,
		status: OrderStatus.COMPLETED,
		passStatus: PassStatus.USED,
		paymentStatus: PaymentStatus.SUCCESS,
		transactionId: "pay_prisma_zero_001",
		checkIn: true,
	});

	const hackathonOrder = await createOrderFlow({
		attendeeId: attendees.miraHackathon.id,
		eventId: hackathon.id,
		tierId: hackathonTiers[0].id,
		quantity: 1,
		status: OrderStatus.PENDING,
		passStatus: PassStatus.ACTIVE,
		paymentStatus: PaymentStatus.FAILED,
		transactionId: "pay_hack_failed_001",
	});

	// Update sold counts
	await prisma.ticketTier.update({
		where: { id: techTiers[0].id },
		data: { soldCount: 2 },
	});
	await prisma.ticketTier.update({
		where: { id: techTiers[1].id },
		data: { soldCount: 1 },
	});
	await prisma.ticketTier.update({
		where: { id: neonTiers[0].id },
		data: { soldCount: 1 },
	});
	await prisma.ticketTier.update({
		where: { id: workshopTier.id },
		data: { soldCount: 1 },
	});
	await prisma.ticketTier.update({
		where: { id: hackathonTiers[0].id },
		data: { soldCount: 1 },
	});

	console.log(
		"Creating notifications across event, order and payment lifecycle...",
	);
	await prisma.notification.createMany({
		data: [
			{
				userId: hostA.id,
				eventId: techSummit.id,
				type: NotificationType.EVENT_CREATED,
				title: "Event Published",
				message: "Global Tech Summit 2026 is now visible to the public.",
				status: NotificationStatus.READ,
				readAt: new Date("2026-02-02T10:00:00Z"),
			},
			{
				userId: attendeeUserA.id,
				eventId: techSummit.id,
				orderId: techOrder1.order.id,
				type: NotificationType.ORDER_CONFIRMED,
				title: "Order Confirmed",
				message: "Your order for Global Tech Summit 2026 is confirmed.",
				status: NotificationStatus.UNREAD,
			},
			{
				userId: attendeeUserA.id,
				eventId: techSummit.id,
				type: NotificationType.CHECK_IN_CONFIRMED,
				title: "Checked In",
				message: "Your check-in at Global Tech Summit 2026 is complete.",
				status: NotificationStatus.UNREAD,
			},
			{
				userId: hostA.id,
				eventId: neonNights.id,
				orderId: neonOrder.order.id,
				type: NotificationType.EVENT_CANCELLED,
				title: "Event Cancelled",
				message: "Neon Nights Music Festival has been cancelled.",
				status: NotificationStatus.UNREAD,
			},
			{
				userId: attendeeUserB.id,
				eventId: techSummit.id,
				orderId: techOrder2.order.id,
				type: NotificationType.PAYMENT_FAILED,
				title: "Payment Pending",
				message: "Complete your payment to confirm the VIP booking.",
				status: NotificationStatus.UNREAD,
			},
			{
				userId: admin.id,
				eventId: prismaWorkshop.id,
				orderId: workshopOrder.order.id,
				type: NotificationType.PAYMENT_SUCCESS,
				title: "Workshop Registration Successful",
				message: "A free workshop registration was completed successfully.",
				status: NotificationStatus.READ,
				readAt: new Date("2026-05-10T14:30:00Z"),
			},
			{
				userId: hostB.id,
				eventId: hackathon.id,
				orderId: hackathonOrder.order.id,
				type: NotificationType.PAYMENT_FAILED,
				title: "Failed Payment",
				message: "A participant payment failed for Campus Buildathon 2026.",
				status: NotificationStatus.UNREAD,
			},
			{
				userId: hostB.id,
				eventId: designMeetup.id,
				type: NotificationType.EVENT_UPDATED,
				title: "Draft Updated",
				message: "Design Systems Roundtable draft agenda has been revised.",
				status: NotificationStatus.UNREAD,
			},
		],
	});

	const totals = {
		users: await prisma.user.count(),
		events: await prisma.event.count(),
		attendees: await prisma.attendee.count(),
		orders: await prisma.order.count(),
		tickets: await prisma.ticket.count(),
		passes: await prisma.pass.count(),
		payments: await prisma.payment.count(),
		notifications: await prisma.notification.count(),
	};

	console.log("✅ Seeding completed successfully!");
	console.table(totals);
}

main()
	.catch((e) => {
		console.error("❌ Seeding failed:");
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
