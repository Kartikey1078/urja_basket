import type { PoolOptions } from "mysql2/promise";

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: PoolOptions["ssl"];
};

function parseMysqlUrl(raw: string): DbConfig | null {
  try {
    const normalized = raw.replace(/^mysql2:\/\//, "mysql://");
    const url = new URL(normalized);
    if (url.protocol !== "mysql:") return null;

    const database = url.pathname.replace(/^\//, "");
    if (!database) return null;

    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      ssl: url.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
    };
  } catch {
    return null;
  }
}

function sslFromEnv(): PoolOptions["ssl"] | undefined {
  const mode = (process.env.DB_SSL ?? "").trim().toLowerCase();
  if (mode === "true" || mode === "1" || mode === "required") {
    return { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" };
  }
  return undefined;
}

/**
 * Resolves MySQL connection settings from env.
 * Supports standard DB_* vars, Railway MYSQL* vars, and MYSQL_URL / DATABASE_URL.
 */
export function resolveDbConfig(): DbConfig {
  const url = process.env.MYSQL_URL ?? process.env.DATABASE_URL;
  if (url?.startsWith("mysql")) {
    const parsed = parseMysqlUrl(url);
    if (parsed) {
      return { ...parsed, ssl: parsed.ssl ?? sslFromEnv() };
    }
  }

  const isProduction = process.env.NODE_ENV === "production";

  const host =
    process.env.DB_HOST ??
    process.env.MYSQLHOST ??
    process.env.MYSQL_HOST ??
    (isProduction ? undefined : "127.0.0.1");

  const port = Number(
    process.env.DB_PORT ?? process.env.MYSQLPORT ?? process.env.MYSQL_PORT ?? 3306
  );

  const user =
    process.env.DB_USER ??
    process.env.MYSQLUSER ??
    process.env.MYSQL_USER ??
    (isProduction ? undefined : "root");

  const password =
    process.env.DB_PASSWORD ?? process.env.MYSQLPASSWORD ?? process.env.MYSQL_PASSWORD ?? "";

  const database =
    process.env.DB_NAME ??
    process.env.MYSQLDATABASE ??
    process.env.MYSQL_DATABASE ??
    (isProduction ? undefined : "urja_basket");

  if (!host || !user || !database) {
    throw new Error(
      "Missing MySQL configuration. Set MYSQL_URL (or DATABASE_URL), or DB_HOST/DB_USER/DB_NAME, " +
        "or Railway MYSQLHOST/MYSQLUSER/MYSQLDATABASE."
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: sslFromEnv(),
  };
}

export function toPoolOptions(config: DbConfig): PoolOptions {
  return {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT ?? 10),
    namedPlaceholders: true,
  };
}
