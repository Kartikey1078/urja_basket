import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

/** JSON 401 for API clients (Bearer token). Prefer over requireAuth() for REST routes. */
export const requireApiAuth: RequestHandler = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};
