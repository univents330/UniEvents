import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "@voltaze/env/server";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaNeon({
	connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
