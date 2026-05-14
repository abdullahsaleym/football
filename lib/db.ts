import "server-only";
import mysql, { Pool, RowDataPacket } from "mysql2/promise";

declare global {
  var __fcomsDbPool: Pool | undefined;
}

function buildPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set in the environment");
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "mysql:") {
    throw new Error(`Unsupported DATABASE_URL protocol: ${parsed.protocol}`);
  }

  const sslParam = parsed.searchParams.get("ssl");
  const sslMode = parsed.searchParams.get("sslmode");
  const wantsSsl =
    sslParam === "true" ||
    sslMode === "require" ||
    sslMode === "verify-ca" ||
    sslMode === "verify-full";

  return mysql.createPool({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database: parsed.pathname.replace(/^\//, ""),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    dateStrings: true,
    decimalNumbers: true,
    ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

export const pool: Pool = global.__fcomsDbPool ?? buildPool();
if (process.env.NODE_ENV !== "production") {
  global.__fcomsDbPool = pool;
}

export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params as never);
  return rows;
}
