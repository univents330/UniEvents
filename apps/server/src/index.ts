import { env } from "@voltaze/env/server";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error";
import communityRoutes from "./routes/community.route";
import eventRoutes from "./routes/event.route";
import orgRoutes from "./routes/org.route";
import paymentRoutes from "./routes/payment.route";
import ticketRoutes from "./routes/ticket.route";

const app = express();

// ── Global middleware ──
app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	}),
);
app.use(express.json());

// ── Health check ──
app.get("/", (_req, res) => {
	res.json({ ok: true, service: "voltaze-api" });
});

// ── Routes ──
app.use("/api/orgs", orgRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/payments", paymentRoutes);

// ── Error handler (must be last) ──
app.use(errorHandler);

// ── Start ──
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
