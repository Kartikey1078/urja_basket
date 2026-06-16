import { HttpError } from "./httpError";

type MysqlErr = Error & { code?: string; errno?: number };

export function mapDbError(err: unknown): HttpError | null {
  if (!(err instanceof Error)) return null;
  const e = err as MysqlErr;
  const code = e.code ?? "";

  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
    return new HttpError(
      503,
      "Database is not running. Start MySQL, then run: cd server && npm run db:migrate"
    );
  }

  if (code === "ER_ACCESS_DENIED_ERROR" || code === "ER_BAD_DB_ERROR") {
    return new HttpError(
      503,
      "Database connection failed. Check DB_USER, DB_PASSWORD, and DB_NAME in server/.env"
    );
  }

  if (code === "ER_NO_SUCH_TABLE") {
    const msg = e.message ?? "";
    if (msg.includes("coupon")) {
      return new HttpError(
        503,
        "Coupon tables missing. Run: cd server && npm run db:coupons"
      );
    }
    return new HttpError(
      503,
      "Database tables missing. Run: cd server && npm run db:init (new DB) or npm run db:migrate"
    );
  }

  if (code === "ER_BAD_FIELD_ERROR" && (e.message ?? "").includes("coupon")) {
    return new HttpError(
      503,
      "Coupon columns missing on carts/orders. Run: cd server && npm run db:coupons"
    );
  }

  if (code === "ER_CANT_CONNECT" || e.message?.includes("connect")) {
    return new HttpError(503, "Cannot connect to MySQL. Check server/.env DB_PORT and that MySQL is started.");
  }

  return null;
}
