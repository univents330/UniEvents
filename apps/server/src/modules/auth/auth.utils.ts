import type { UserRole } from "@voltaze/db";
import { env } from "@voltaze/env/server";
import { z } from "zod";

const textEncoder = new TextEncoder();

const accessTokenPayloadSchema = z.object({
	sub: z.string(),
	sessionId: z.string(),
	email: z.string().email(),
	role: z.enum(["ADMIN", "HOST", "USER"]),
	type: z.literal("access"),
	iat: z.number().int().nonnegative(),
	exp: z.number().int().positive(),
	iss: z.string().min(1),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

const accessKeyPromise = crypto.subtle.importKey(
	"raw",
	textEncoder.encode(env.JWT_ACCESS_SECRET),
	{ name: "HMAC", hash: "SHA-256" },
	false,
	["sign", "verify"],
);

const refreshKeyPromise = crypto.subtle.importKey(
	"raw",
	textEncoder.encode(env.JWT_REFRESH_SECRET),
	{ name: "HMAC", hash: "SHA-256" },
	false,
	["sign"],
);

function encodeBase64Url(value: string | Uint8Array) {
	return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
	return Buffer.from(value, "base64url");
}

function createAccessPayload(input: {
	userId: string;
	sessionId: string;
	email: string;
	role: UserRole;
}) {
	const issuedAt = Math.floor(Date.now() / 1000);
	return accessTokenPayloadSchema.parse({
		sub: input.userId,
		sessionId: input.sessionId,
		email: input.email,
		role: input.role,
		type: "access",
		iat: issuedAt,
		exp: issuedAt + env.ACCESS_TOKEN_TTL_SECONDS,
		iss: env.AUTH_ISSUER,
	});
}

async function signJwt(payload: AccessTokenPayload) {
	const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = encodeBase64Url(JSON.stringify(payload));
	const unsignedToken = `${header}.${body}`;
	const signature = await crypto.subtle.sign(
		"HMAC",
		await accessKeyPromise,
		textEncoder.encode(unsignedToken),
	);

	return `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function createAccessToken(input: {
	userId: string;
	sessionId: string;
	email: string;
	role: UserRole;
}) {
	const payload = createAccessPayload(input);
	return {
		token: await signJwt(payload),
		expiresAt: new Date(payload.exp * 1000),
	};
}

export async function verifyAccessToken(token: string) {
	const [header, payload, signature] = token.split(".");

	if (!header || !payload || !signature) {
		throw new Error("Invalid token structure");
	}

	const unsignedToken = `${header}.${payload}`;
	const isValid = await crypto.subtle.verify(
		"HMAC",
		await accessKeyPromise,
		decodeBase64Url(signature),
		textEncoder.encode(unsignedToken),
	);

	if (!isValid) {
		throw new Error("Invalid token signature");
	}

	const parsedPayload = accessTokenPayloadSchema.parse(
		JSON.parse(decodeBase64Url(payload).toString("utf8")),
	);

	if (parsedPayload.iss !== env.AUTH_ISSUER) {
		throw new Error("Invalid token issuer");
	}

	if (parsedPayload.exp <= Math.floor(Date.now() / 1000)) {
		throw new Error("Token expired");
	}

	return parsedPayload;
}

export async function hashPassword(password: string) {
	return Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
	return Bun.password.verify(password, hash);
}

export function createRefreshToken() {
	return encodeBase64Url(crypto.getRandomValues(new Uint8Array(48)));
}

export async function hashRefreshToken(token: string) {
	const mac = await crypto.subtle.sign(
		"HMAC",
		await refreshKeyPromise,
		textEncoder.encode(token),
	);
	return Buffer.from(mac).toString("hex");
}

export function createRefreshExpiryDate() {
	return new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000);
}
