import prisma from "@voltaze/db";
import type { NextFunction, Request, Response } from "express";

export type AuthedRequest = Request & {
	user?: {
		id: string;
		email: string;
		name?: string | null;
		role: string;
	};
};

const parseCookies = (cookieHeader?: string): Record<string, string> => {
	if (!cookieHeader) return {};
	return Object.fromEntries(
		cookieHeader
			.split(";")
			.map((pair) => {
				const [k, v] = pair.split("=");
				if (!k) return ["", ""];
				return [k.trim(), decodeURIComponent((v || "").trim())];
			})
			.filter(([key]) => typeof key === "string" && key.length > 0),
	);
};

export const getSessionToken = (req: Request): string | undefined => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		return authHeader.slice(7).trim();
	}
	const tokenHeader = req.headers["x-session-token"];
	if (typeof tokenHeader === "string") {
		return tokenHeader;
	}
	const cookies = parseCookies(req.headers.cookie);
	return cookies["next-auth.session-token"] || cookies["__session"];
};

export const requireAuth = async (
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const sessionToken = getSessionToken(req);
		if (!sessionToken) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const session = await prisma.session.findUnique({
			where: { token: sessionToken },
			include: { user: true },
		});

		if (!session || !session.user || session.expiresAt < new Date()) {
			return res.status(401).json({ message: "Invalid or expired session" });
		}

		req.user = {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			role: session.user.role,
		};
		return next();
	} catch (error) {
		return res.status(500).json({ message: "Auth validation failed", error });
	}
};
