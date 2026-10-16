import { readFile } from "node:fs/promises";
import pg from "pg";
try {
  process.loadEnvFile(".env");
} catch {}
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
});
try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL requerida");
  await db.connect();
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(528194117)");
  await db.query(
    await readFile(
      new URL("../db/migrations/001_crm.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.query(
    await readFile(
      new URL("../db/migrations/002_first_login.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.query(
    await readFile(
      new URL("../db/migrations/003_messenger_sync.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.query("COMMIT");
  console.log("Esquema CRM oktae actualizado.");
} catch (e) {
  try {
    await db.query("ROLLBACK");
  } catch {}
  console.error("Migración fallida:", e.code || e.name);
  process.exitCode = 1;
} finally {
  await db.end();
}
