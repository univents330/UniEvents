import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../lib/errors";

interface ValidateOptions {
	body?: ZodType;
	params?: ZodType;
	query?: ZodType;
}

/**
 * Zod validation middleware factory.
 *
 * Usage:
 * ```ts
 * router.post("/", validate({ body: createOrgSchema }), controller.create);
 * ```
 */
export function validate(schemas: ValidateOptions) {
	return (req: Request, _res: Response, next: NextFunction) => {
		const errors: Record<string, string[]> = {};

		if (schemas.body) {
			const result = schemas.body.safeParse(req.body);
			if (!result.success) {
				for (const issue of result.error.issues) {
					const path = issue.path.join(".") || "body";
					errors[path] = errors[path] ?? [];
					errors[path].push(issue.message);
				}
			} else {
				req.body = result.data;
			}
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params);
			if (!result.success) {
				for (const issue of result.error.issues) {
					const path = issue.path.join(".") || "params";
					errors[path] = errors[path] ?? [];
					errors[path].push(issue.message);
				}
			} else {
				Object.assign(req.params, result.data);
			}
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query);
			if (!result.success) {
				for (const issue of result.error.issues) {
					const path = issue.path.join(".") || "query";
					errors[path] = errors[path] ?? [];
					errors[path].push(issue.message);
				}
			} else {
				(req as Request & { validatedQuery: unknown }).validatedQuery =
					result.data;
			}
		}

		if (Object.keys(errors).length > 0) {
			return next(new ValidationError(errors));
		}

		next();
	};
}
