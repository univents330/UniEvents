import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";

export const getAuthenticatedUser = async (
	req: AuthedRequest,
	res: Response,
) => {
	if (!req.user) {
		return res.status(401).json({ message: "Not authenticated" });
	}

	return res.json({ user: req.user });
};
