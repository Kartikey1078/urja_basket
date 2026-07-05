/**
 * Production deploy helper: run DB migrations before starting the API.
 * Fresh databases get --init (catalog + seed); existing DBs run checkout migrations only.
 *
 * Usage on EC2: npm run deploy:migrate
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { resolveDbConfig } from "../src/config/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

async function hasCatalogTables(): Promise<boolean> {
  const db = resolveDbConfig();
  let connection: mysql.Connection | undefined;

  try {
    connection = await mysql.createConnection({
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.database,
      ssl: db.ssl,
    });

    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT 1 FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories'
       LIMIT 1`,
      [db.database]
    );
    return rows.length > 0;
  } catch {
    return false;
  } finally {
    await connection?.end();
  }
}

async function main() {
  const fresh = !(await hasCatalogTables());
  const args = fresh ? ["--init"] : [];
  const label = fresh ? "db:init (fresh database)" : "db:migrate";

  console.log(`[deploy:migrate] Running ${label}...`);
  execSync(`npx tsx scripts/apply-migrations.ts ${args.join(" ")}`.trim(), {
    cwd: serverRoot,
    stdio: "inherit",
    env: process.env,
  });
  console.log("[deploy:migrate] Database ready.");
}

void main().catch((err) => {
  console.error("[deploy:migrate] Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
