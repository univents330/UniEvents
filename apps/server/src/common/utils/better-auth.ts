import { dash } from "@better-auth/infra";
import { prisma } from "@voltaze/db";
import { env } from "@voltaze/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getAllowedCorsOrigins } from "./cors-origins";

const googleProvider =
	env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}
		: undefined;

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	plugins: env.BETTER_AUTH_API_KEY
		? [
				dash({
					apiKey: env.BETTER_AUTH_API_KEY,
				}),
			]
		: [],
	socialProviders: googleProvider
		? {
				google: googleProvider,
			}
		: undefined,
	emailAndPassword: {
		enabled: true,
	},
	advanced:
		process.env.NODE_ENV === "production"
			? {
					defaultCookieAttributes: {
						sameSite: "none",
						secure: true,
					},
				}
			: undefined,
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "USER",
				input: false,
			},
		},
	},
	trustedOrigins: getAllowedCorsOrigins(),
});
