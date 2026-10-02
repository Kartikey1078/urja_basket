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
  const conn = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
  });
  const [r] = await conn.execute(
    `UPDATE categories SET image = '/home/gifthampers.png', name = 'Gift Hamper' WHERE slug = 'gift-hampers'`
  );
  console.log("Updated gift-hampers category image.", r);
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
