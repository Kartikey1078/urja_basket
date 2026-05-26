/**
 * @deprecated Prefer: npm run db:init  (fresh)  or  npm run db:migrate
 * Forwards to apply-migrations with --init --demo when run without flags.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(__dirname, "apply-migrations.ts");
const seedOnly = process.argv.includes("--seed-only");
const args = ["tsx", script, ...(seedOnly ? ["--demo"] : ["--init", "--demo"])];

const result = spawnSync("npx", args, { stdio: "inherit", cwd: path.join(__dirname, "..") });
process.exit(result.status ?? 1);
