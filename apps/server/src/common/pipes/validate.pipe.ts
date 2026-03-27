import type { RequestHandler } from "express";

type ValidationSchemas = {
	body?: { parse: (input: unknown) => unknown };
	query?: { parse: (input: unknown) => unknown };
	params?: { parse: (input: unknown) => unknown };
};

export function validatePipe(schemas: ValidationSchemas): RequestHandler {
	return (req, _res, next) => {
		if (schemas.body) {
			req.body = schemas.body.parse(req.body) as never;
		}

		if (schemas.query) {
			req.query = schemas.query.parse(req.query) as never;
		}

		if (schemas.params) {
			req.params = schemas.params.parse(req.params) as never;
		}

		next();
	};
}
