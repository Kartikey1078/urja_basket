import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (req, res, next) => {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.length < 8) {
    res.status(503).json({ error: "ADMIN_API_KEY is not set or too short (min 8 chars)" });
    return;
  }
  const auth = req.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;
  const raw = req.headers["x-admin-key"];
  const headerKey =
    typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : undefined;
  if (bearer === key || headerKey === key) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
};
