import type { NextFunction, Request, Response } from "express";

export function loggerMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const startedAt = Date.now();
	const requestId = (req as Request & { requestId?: string }).requestId;

	res.on("finish", () => {
		const durationMs = Date.now() - startedAt;
		console.log(
			`[${requestId ?? "n/a"}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
		);
	});

	next();
}
