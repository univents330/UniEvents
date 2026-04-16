import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "@voltaze/env/server";

import { PrismaClient } from "../prisma/generated/client";

export * from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Prefer HTTP fetch for pooled queries to avoid WebSocket connectivity issues
// in local/dev environments where wss to Neon may be blocked.
neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({
	connectionString: env.DATABASE_URL,
});

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
