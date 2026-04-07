import { env } from "@voltaze/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express } from "express";

import { errorHandlerMiddleware } from "./common/filters/error.filter";
import { loggerMiddleware } from "./common/middlewares/logger.middleware";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware";
import { requestIdMiddleware } from "./common/middlewares/request-id.middleware";
import {
	apiRateLimitMiddleware,
	securityHeadersMiddleware,
} from "./common/middlewares/security.middleware";
import { auth } from "./common/utils/better-auth";
import { getAllowedCorsOrigins } from "./common/utils/cors-origins";
import { registerModules } from "./modules";

export function createApp(): Express {
	const app = express();
	app.set("trust proxy", 1);

	app.use(securityHeadersMiddleware);
	app.use(apiRateLimitMiddleware);

	app.use(
		cors({
			origin: getAllowedCorsOrigins(),
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	);
	app.use(requestIdMiddleware);
	app.use(loggerMiddleware);
	app.all("/api/auth/{*any}", toNodeHandler(auth));
	app.get("/", (_req, res) => {
		res.status(200).json({
			message: "Voltaze server is running",
			timestamp: new Date().toISOString(),
		});
	});
	app.use(
		express.json({
			verify: (req, _res, buf) => {
				(req as { rawBody?: string }).rawBody = buf.toString("utf8");
			},
		}),
	);

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
	});

	registerModules(app);
	app.use(notFoundMiddleware);
	app.use(errorHandlerMiddleware);

	return app;
}
