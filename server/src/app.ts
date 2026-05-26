import { clerkMiddleware } from "@clerk/express";
import express from "express";

import { v1Router } from "./api/v1/routes/index";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { meRouter } from "./modules/users/routes/me.routes";

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const allowedOrigin =
      requestOrigin && env.corsOrigins.includes(requestOrigin)
        ? requestOrigin
        : env.corsOrigins[0];

    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(
    clerkMiddleware({
      secretKey: env.clerk.secretKey,
      publishableKey: env.clerk.publishableKey,
      authorizedParties: env.corsOrigins,
    })
  );

  app.use(express.json());
  app.use("/api/me", meRouter);
  app.use("/api/v1", v1Router);
  app.use(errorHandler);
  return app;
}
