import { existsSync } from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

import { resolveDbConfig } from "./db";

/** Load `.env` from the `server/` package root (not `process.cwd()`), so admin/API work when started from any directory. */
const serverRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(serverRoot, ".env") });
if (existsSync(path.join(serverRoot, ".env.local"))) {
  dotenv.config({ path: path.join(serverRoot, ".env.local"), override: true });
}

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === "production";

  if (!raw) {
    if (isProduction) {
      throw new Error(
        "CORS_ORIGIN is required in production (comma-separated storefront + admin URLs)."
      );
    }
    return ["http://localhost:3000", "http://localhost:3001"];
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: corsOrigins(),
  clerk: {
    secretKey: required("CLERK_SECRET_KEY"),
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  db: resolveDbConfig(),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  },
};
