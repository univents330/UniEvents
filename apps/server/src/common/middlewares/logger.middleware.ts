import type { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";

function truncateBody(body: unknown): unknown {
	if (!body || typeof body !== "object") return body;
	const str = JSON.stringify(body);
	if (str.length > 2000) {
		return `${str.slice(0, 2000)}… [truncated, ${str.length} chars total]`;
	}
	return body;
}

export function loggerMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const startedAt = Date.now();
	const requestId = (req as Request & { requestId?: string }).requestId;

	// ── Incoming request log ──
	const incomingContext: Record<string, unknown> = {
		requestId: requestId ?? "n/a",
		method: req.method,
		url: req.originalUrl,
		ip: req.ip,
		origin: req.get("origin") ?? "—",
		contentType: req.get("content-type") ?? "—",
		hasAuth: Boolean(req.get("authorization") || req.get("cookie")),
	};

	if (Object.keys(req.query).length > 0) {
		incomingContext.query = req.query;
	}

	if (req.body && Object.keys(req.body as object).length > 0) {
		incomingContext.body = truncateBody(req.body);
	}

	logger.debug(`→ ${req.method} ${req.originalUrl}`, incomingContext);

	// ── Response log on finish ──
	res.on("finish", () => {
		const durationMs = Date.now() - startedAt;
		const status = res.statusCode;
		const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

		const msg = `← ${req.method} ${req.originalUrl} ${status} ${durationMs}ms`;
		const ctx = { requestId: requestId ?? "n/a" };

		if (level === "error") {
			logger.error(msg, undefined, ctx);
		} else if (level === "warn") {
			logger.warn(msg, ctx);
		} else {
			logger.info(msg, ctx);
		}
	});

	next();
}
