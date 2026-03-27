import { env } from "@voltaze/env/server";
import cors from "cors";
import express, { type Express } from "express";

import { errorHandlerMiddleware } from "./common/filters/error.filter";
import { loggerMiddleware } from "./common/middlewares/logger.middleware";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware";
import { requestIdMiddleware } from "./common/middlewares/request-id.middleware";
import { registerModules } from "./modules";

export function createApp(): Express {
	const app = express();

	app.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	);
	app.use(requestIdMiddleware);
	app.use(loggerMiddleware);
	app.use(express.json());

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
	});

	registerModules(app);
	app.use(notFoundMiddleware);
	app.use(errorHandlerMiddleware);

	return app;
}
