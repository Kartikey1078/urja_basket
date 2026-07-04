import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { resolveDbConfig } from "../src/config/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const INIT_MIGRATIONS = [
  "001_core_catalog_tables.sql",
  "002_seed_sample_data.sql",
] as const;

const CHECKOUT_MIGRATIONS = [
  "003_users_table.sql",
  "004_cart_tables.sql",
  "005_user_addresses.sql",
  "006_orders_and_payments.sql",
  "007_cod_payment.sql",
  "008_order_tracking.sql",
  "009_site_settings.sql",
  "010_admin_users.sql",
  "011_coupons_system.sql",
  "012_nutrition_tags.sql",
  "013_nutrition_tag_catalog.sql",
  "014_order_inventory.sql",
  "015_payment_refunded.sql",
  "016_pos_tables.sql",
] as const;

const DEMO_SEEDS = ["db/seed-cart.sql", "db/seed-address.sql"] as const;

async function runSqlFile(
  connection: mysql.Connection,
  filePath: string,
  label: string
) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${filePath}`);
  }
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`Applying ${label}...`);
  await connection.query(sql);
  console.log(`Applied ${label}`);
}

async function main() {
  const init = process.argv.includes("--init");
  const demo = process.argv.includes("--demo");

  const db = resolveDbConfig();

  console.log(`Connecting to MySQL at ${db.host}:${db.port}/${db.database}...`);

  const admin = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    ssl: db.ssl,
    multipleStatements: true,
  });

  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await admin.end();

  const connection = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    ssl: db.ssl,
    multipleStatements: true,
  });

  const migrationsDir = path.join(serverRoot, "database", "migrations");

  if (init) {
    for (const name of INIT_MIGRATIONS) {
      await runSqlFile(
        connection,
        path.join(migrationsDir, name),
        name
      );
    }
  } else {
    console.log("Skipping 001/002 (use --init for full catalog reset + seed).");
  }

  for (const name of CHECKOUT_MIGRATIONS) {
    await runSqlFile(connection, path.join(migrationsDir, name), name);
  }

  if (demo) {
    if (!init) {
      console.warn(
        "Note: --demo seeds expect catalog from 002. Run with --init --demo on a fresh DB."
      );
    }
    for (const rel of DEMO_SEEDS) {
      await runSqlFile(connection, path.join(serverRoot, rel), rel);
    }
  }

  const [tables] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (
       'users','carts','cart_items','user_addresses','orders','order_items','payments','products','categories',
       'coupons','coupon_redemptions','coupon_abuse_logs'
     )
     ORDER BY TABLE_NAME`,
    [db.database]
  );

  const tableNames = tables.map((r) => r.TABLE_NAME as string);
  console.log("\nTables present:", tableNames.join(", ") || "(none)");

  const couponTables = ["coupons", "coupon_redemptions", "coupon_abuse_logs"];
  const missingCoupons = couponTables.filter((t) => !tableNames.includes(t));
  if (missingCoupons.length > 0) {
    console.warn(
      "\nCoupon tables missing:",
      missingCoupons.join(", "),
      "\n→ Run: npm run db:coupons"
    );
  } else {
    const [couponRows] = await connection.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS c FROM coupons"
    );
    console.log("Coupons seeded:", couponRows[0]?.c ?? 0);
  }

  await connection.end();
  console.log("\nDone. Restart the API server (npm run dev).");
}

void main().catch((err) => {
  console.error("\nMigration failed:", err instanceof Error ? err.message : err);
  console.error(
    "\nTips:\n" +
      "  1. Start MySQL (Docker, MAMP, or brew services start mysql)\n" +
      "  2. Match DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in server/.env\n" +
      "  3. Fresh DB: npm run db:init\n" +
      "  4. Existing catalog: npm run db:migrate\n"
  );
  process.exit(1);
});
