import type { Express } from "express";

import { createGuestCheckoutRouter } from "./guest-checkout.router";

export function registerGuestCheckoutModule(app: Express) {
	app.use("/guest-checkout", createGuestCheckoutRouter());
}
