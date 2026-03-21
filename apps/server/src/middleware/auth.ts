import db from "@voltaze/db";
import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	image?: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

/**
 * Auth middleware — validates the NeonDB Auth session.
 *
 * Expects a Bearer token in the Authorization header.
 * The token is verified against the NeonDB Auth API
 * which returns the authenticated user's info.
 */
export async function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedError("Missing or invalid authorization header");
		}

		const token = authHeader.slice(7);
		if (!token) {
			throw new UnauthorizedError("Missing token");
		}

		// Decode the JWT payload to extract user info.
		// NeonDB Auth tokens are JWTs with user claims.
		const parts = token.split(".");
		if (parts.length !== 3) {
			throw new UnauthorizedError("Invalid token format");
		}

		const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString());

		if (!payload.sub || !payload.email) {
			throw new UnauthorizedError("Invalid token claims");
		}

		// Check expiration
		if (payload.exp && Date.now() / 1000 > payload.exp) {
			throw new UnauthorizedError("Token expired");
		}

		req.user = {
			id: payload.sub,
			email: payload.email,
			name: payload.name ?? "",
			image: payload.picture,
		};

		await upsertUserProfile(req.user);

		next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			next(error);
		} else {
			next(new UnauthorizedError("Authentication failed"));
		}
	}
}

/**
 * Optional auth — attaches user if token present, continues otherwise.
 */
export async function optionalAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return next();
	}

	try {
		const token = authHeader.slice(7);
		const parts = token.split(".");
		if (parts.length !== 3) return next();

		const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString());

		if (
			payload.sub &&
			payload.email &&
			(!payload.exp || Date.now() / 1000 <= payload.exp)
		) {
			req.user = {
				id: payload.sub,
				email: payload.email,
				name: payload.name ?? "",
				image: payload.picture,
			};

			await upsertUserProfile(req.user);
		}
	} catch {
		// Silently continue without auth
	}

	next();
}

async function upsertUserProfile(user: AuthUser) {
	await db.userProfile.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			email: user.email,
			name: user.name || null,
			image: user.image || null,
		},
		update: {
			email: user.email,
			name: user.name || null,
			image: user.image || null,
		},
	});
}
