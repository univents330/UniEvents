import { env } from "@voltaze/env/server";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth_routes";
import eventRouter from "./routes/event_routes";
import orderRouter from "./routes/order_routes";
import passRouter from "./routes/pass_routes";
import paymentRouter from "./routes/payment_routes";
import ticketRouter from "./routes/ticket_routes";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());

app.use("/api", authRouter);
app.use("/api", ticketRouter);
app.use("/api", eventRouter);
app.use("/api", passRouter);
app.use("/api", orderRouter);
app.use("/api", paymentRouter);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
