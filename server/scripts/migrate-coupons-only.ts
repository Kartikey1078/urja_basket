/**
 * Applies only 011_coupons_system.sql (safe to re-run).
 * Use when coupon tables are missing but catalog/checkout tables already exist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const COUPON_MIGRATION = "011_coupons_system.sql";

async function verify(connection: mysql.Connection, database: string) {
  const [tables] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('coupons', 'coupon_redemptions', 'coupon_abuse_logs')
     ORDER BY TABLE_NAME`,
    [database]
  );

  const [cartCol] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'carts' AND COLUMN_NAME = 'applied_coupon_id'`,
    [database]
  );

  const [orderCol] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'coupon_id'`,
    [database]
  );

  const [coupons] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT code, title, type FROM coupons ORDER BY id"
  );

  console.log("\n--- Coupon schema check ---");
  console.log("Tables:", tables.map((r) => r.TABLE_NAME).join(", ") || "(none)");
  console.log("carts.applied_coupon_id:", Number(cartCol[0]?.c) > 0 ? "yes" : "no");
  console.log("orders.coupon_id:", Number(orderCol[0]?.c) > 0 ? "yes" : "no");
  console.log("Seed coupons:", coupons.length);
  for (const row of coupons) {
    console.log(`  - ${row.code}: ${row.title} (${row.type})`);
  }

  const ok =
    tables.length === 3 &&
    Number(cartCol[0]?.c) > 0 &&
    Number(orderCol[0]?.c) > 0 &&
    coupons.length > 0;

  if (!ok) {
    throw new Error("Coupon migration incomplete. Check MySQL errors above.");
  }
}

async function main() {
  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "urja_basket";

  const filePath = path.join(serverRoot, "database", "migrations", COUPON_MIGRATION);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${COUPON_MIGRATION}`);
  }

  console.log(`Connecting to MySQL at ${host}:${port} (database: ${database})...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`Applying ${COUPON_MIGRATION}...`);
  await connection.query(sql);
  console.log(`Applied ${COUPON_MIGRATION}`);

  await verify(connection, database);
  await connection.end();

  console.log("\nDone. Restart the API: cd server && npm run dev");
}

void main().catch((err) => {
  console.error("\nCoupon migration failed:", err instanceof Error ? err.message : err);
  console.error(
    "\nEnsure MySQL is running and server/.env matches your instance (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).\n" +
      "Prerequisite: checkout tables (orders, carts) — run npm run db:migrate first if needed.\n"
  );
  process.exit(1);
});
