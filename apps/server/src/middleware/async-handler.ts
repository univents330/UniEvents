import type { NextFunction, Request, Response } from "express";

export type AsyncHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<any>;

/**
 * Wraps async route handlers to catch errors and pass them to the error handler middleware.
 * Usage: router.get("/", asyncHandler(controllerFunction))
 */
export function asyncHandler(fn: AsyncHandler) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
