import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

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

  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "urja_basket";

  console.log(`Connecting to MySQL at ${host}:${port}...`);

  const admin = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await admin.end();

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
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
       'users','carts','cart_items','user_addresses','orders','order_items','payments','products','categories'
     )
     ORDER BY TABLE_NAME`,
    [database]
  );

  console.log("\nTables present:", tables.map((r) => r.TABLE_NAME).join(", ") || "(none)");
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
