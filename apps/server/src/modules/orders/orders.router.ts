import {
	createOrderSchema,
	idParamSchema,
	orderFilterSchema,
	updateOrderSchema,
} from "@voltaze/schema";
import { Router } from "express";

import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { ordersController } from "./orders.controller";

export function createOrdersRouter(): Router {
	const router = Router();

	router.get(
		"/",
		validatePipe({ query: orderFilterSchema }),
		asyncHandler((req, res) => ordersController.list(req, res)),
	);
	router.get(
		"/:id",
		validatePipe({ params: idParamSchema }),
		asyncHandler((req, res) => ordersController.getById(req, res)),
	);
	router.post(
		"/",
		validatePipe({ body: createOrderSchema }),
		asyncHandler((req, res) => ordersController.create(req, res)),
	);
	router.patch(
		"/:id",
		validatePipe({ params: idParamSchema, body: updateOrderSchema }),
		asyncHandler((req, res) => ordersController.update(req, res)),
	);

	return router;
}
