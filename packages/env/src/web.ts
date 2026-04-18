import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {},
	client: {
		NEXT_PUBLIC_SERVER_URL: z.url().default("http://localhost:3000"),
		NEXT_PUBLIC_SERVER_URLS: z.string().optional(),
		NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1).optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
		NEXT_PUBLIC_SERVER_URLS: process.env.NEXT_PUBLIC_SERVER_URLS,
		NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
	},
	emptyStringAsUndefined: true,
});
