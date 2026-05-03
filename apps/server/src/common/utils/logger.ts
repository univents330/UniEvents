import { env } from "@unievent/env/server";
import pino from "pino";

const isDevelopment = env.NODE_ENV === "development";

const pinoLogger = pino({
	level: isDevelopment ? "debug" : "info",
	transport: isDevelopment
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					ignore: "pid,hostname",
					translateTime: "HH:MM:ss Z",
				},
			}
		: undefined,
});

interface LogContext {
	requestId?: string;
	userId?: string;
	[key: string]: unknown;
}

class Logger {
	info(message: string, context?: LogContext) {
		if (context) {
			pinoLogger.info(context, message);
		} else {
			pinoLogger.info(message);
		}
	}

	warn(message: string, context?: LogContext) {
		if (context) {
			pinoLogger.warn(context, message);
		} else {
			pinoLogger.warn(message);
		}
	}

	error(message: string, error?: unknown, context?: LogContext) {
		const errObj = error instanceof Error ? error : new Error(String(error));
		if (context) {
			pinoLogger.error({ ...context, err: errObj }, message);
		} else {
			pinoLogger.error({ err: errObj }, message);
		}
	}

	debug(message: string, context?: LogContext) {
		if (context) {
			pinoLogger.debug(context, message);
		} else {
			pinoLogger.debug(message);
		}
	}
}

export const logger = new Logger();
