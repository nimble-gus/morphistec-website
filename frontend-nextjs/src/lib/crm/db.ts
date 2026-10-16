import "server-only";
import { Pool } from "pg";
const globalDb = globalThis as unknown as { oktaePool?: Pool };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no configurada");
  return (globalDb.oktaePool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    statement_timeout: 15000,
  }));
}
