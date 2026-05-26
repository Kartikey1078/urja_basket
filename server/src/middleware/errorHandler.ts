import type { ErrorRequestHandler } from "express";
import { mapDbError } from "../errors/mapDbError";
import { HttpError } from "../errors/httpError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  const dbMapped = mapDbError(err);
  if (dbMapped) {
    res.status(dbMapped.status).json({ error: dbMapped.message });
    return;
  }

  const message =
    err instanceof Error && err.message && err.message !== "Internal Server Error"
      ? err.message
      : "Something went wrong. Check server logs and ensure MySQL is running.";
  const status = 500;
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ error: message });
};
