import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { resolveDbConfig } from "../src/config/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

async function main() {
  const db = resolveDbConfig();
  const sql = fs.readFileSync(
    path.join(serverRoot, "database/migrations/020_product_basket_fruits.sql"),
    "utf8"
  );
  const conn = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log("Applied basket_fruits column.");
  } catch (e) {
    const err = e as { code?: string; errno?: number };
    if (err.code === "ER_DUP_FIELDNAME" || err.errno === 1060) {
      console.log("Column basket_fruits already exists.");
    } else {
      throw e;
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
