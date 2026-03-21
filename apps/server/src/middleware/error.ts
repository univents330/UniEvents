import type { NextFunction, Request, Response } from "express";
import { AppError, ValidationError } from "../lib/errors";

/**
 * Global error handler — must be registered last via app.use().
 */
export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof ValidationError) {
		res.status(400).json({
			ok: false,
			code: err.code,
			message: err.message,
			errors: err.errors,
		});
		return;
	}

	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			ok: false,
			code: err.code,
			message: err.message,
		});
		return;
	}

	console.error("Unhandled error:", err);

	res.status(500).json({
		ok: false,
		code: "INTERNAL_ERROR",
		message: "An unexpected error occurred",
	});
}
