import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const DEV_ACCESS_SECRET = "development-access-secret-change-me-12345";
const DEV_REFRESH_SECRET = "development-refresh-secret-change-me-12345";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		CORS_ORIGIN: z.url(),
		JWT_ACCESS_SECRET: z
			.string()
			.min(32)
			.default(DEV_ACCESS_SECRET)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" || value !== DEV_ACCESS_SECRET,
				"JWT_ACCESS_SECRET must be set to a non-default value in production",
			),
		JWT_REFRESH_SECRET: z
			.string()
			.min(32)
			.default(DEV_REFRESH_SECRET)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" || value !== DEV_REFRESH_SECRET,
				"JWT_REFRESH_SECRET must be set to a non-default value in production",
			),
		ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
		REFRESH_TOKEN_TTL_SECONDS: z.coerce
			.number()
			.int()
			.positive()
			.default(2_592_000),
		AUTH_ISSUER: z.string().min(1).default("voltaze-server"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
