import type { RowDataPacket } from "mysql2";

import { pool } from "../database/pool";

let tablesReadyCache: boolean | null = null;

const REQUIRED_TABLES = ["coupons", "coupon_redemptions", "coupon_abuse_logs"] as const;

export function isMissingCouponSchemaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as { code?: string };
  return (
    e.code === "ER_NO_SUCH_TABLE" ||
    e.code === "ER_BAD_FIELD_ERROR" ||
    e.code === "ER_BAD_DB_ERROR"
  );
}

export function invalidateCouponSchemaCache(): void {
  tablesReadyCache = null;
}

/** True when coupons + cart/order coupon columns exist. */
export async function couponSchemaReady(): Promise<boolean> {
  if (tablesReadyCache !== null) return tablesReadyCache;

  try {
    const [tableRows] = await pool.query<RowDataPacket[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME IN (?, ?, ?)`,
      [...REQUIRED_TABLES]
    );
    if (tableRows.length < REQUIRED_TABLES.length) {
      tablesReadyCache = false;
      return false;
    }

    const [cartCols] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'carts'
         AND COLUMN_NAME = 'applied_coupon_id'`
    );
    const [orderCols] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'orders'
         AND COLUMN_NAME = 'coupon_id'`
    );

    const ready =
      Number(cartCols[0]?.c) > 0 && Number(orderCols[0]?.c) > 0;
    tablesReadyCache = ready;
    return ready;
  } catch {
    tablesReadyCache = false;
    return false;
  }
}

export const COUPON_MIGRATE_HINT =
  "Coupon tables missing. Run: cd server && npm run db:coupons";
