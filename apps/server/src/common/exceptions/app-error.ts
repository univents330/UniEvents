export class AppError extends Error {
	public readonly statusCode: number;
	public readonly details?: unknown;

	constructor(message: string, statusCode = 500, details?: unknown) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
		this.details = details;
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", details?: unknown) {
		super(message, 404, details);
		this.name = "NotFoundError";
	}
}

export class ConflictError extends AppError {
	constructor(message = "Resource conflict", details?: unknown) {
		super(message, 409, details);
		this.name = "ConflictError";
	}
}

export class BadRequestError extends AppError {
	constructor(message = "Bad request", details?: unknown) {
		super(message, 400, details);
		this.name = "BadRequestError";
	}
}
