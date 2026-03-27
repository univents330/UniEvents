import { Prisma } from "@voltaze/db";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../exceptions/app-error";

export function errorHandlerMiddleware(
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (error instanceof ZodError) {
		return res.status(400).json({
			message: "Validation failed",
			details: error.flatten(),
		});
	}

	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			message: error.message,
			details: error.details,
		});
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === "P2025") {
			return res
				.status(404)
				.json({ message: "Resource not found", details: error.meta });
		}

		if (error.code === "P2002") {
			return res
				.status(409)
				.json({ message: "Unique constraint violation", details: error.meta });
		}

		return res
			.status(400)
			.json({ message: "Database request failed", details: error.meta });
	}

	if (
		error instanceof Prisma.PrismaClientInitializationError ||
		error instanceof Prisma.PrismaClientRustPanicError ||
		error instanceof Prisma.PrismaClientUnknownRequestError
	) {
		return res.status(503).json({ message: "Database unavailable" });
	}

	console.error(error);
	return res.status(500).json({ message: "Internal server error" });
}
