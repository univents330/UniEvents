import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const DEV_ACCESS_SECRET = "development-access-secret-change-me-12345";
const DEV_REFRESH_SECRET = "development-refresh-secret-change-me-12345";
const DEV_RAZORPAY_KEY_ID = "rzp_test_development_key_id";
const DEV_RAZORPAY_KEY_SECRET = "development-razorpay-key-secret-12345";
const DEV_RAZORPAY_WEBHOOK_SECRET =
	"development-razorpay-webhook-secret-change-me-12345";

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
		RAZORPAY_KEY_ID: z
			.string()
			.min(1)
			.default(DEV_RAZORPAY_KEY_ID)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" ||
					value !== DEV_RAZORPAY_KEY_ID,
				"RAZORPAY_KEY_ID must be set to a non-default value in production",
			),
		RAZORPAY_KEY_SECRET: z
			.string()
			.min(1)
			.default(DEV_RAZORPAY_KEY_SECRET)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" ||
					value !== DEV_RAZORPAY_KEY_SECRET,
				"RAZORPAY_KEY_SECRET must be set to a non-default value in production",
			),
		RAZORPAY_WEBHOOK_SECRET: z
			.string()
			.min(32)
			.default(DEV_RAZORPAY_WEBHOOK_SECRET)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" ||
					value !== DEV_RAZORPAY_WEBHOOK_SECRET,
				"RAZORPAY_WEBHOOK_SECRET must be set to a non-default value in production",
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
