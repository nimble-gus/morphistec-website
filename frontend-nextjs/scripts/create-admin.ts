import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import pg from "pg";
import { hashPassword } from "../src/lib/crm/password";
try {
  process.loadEnvFile(".env");
} catch {}
const rl = createInterface({ input: stdin, output: stdout });
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
});
async function main() {
  try {
    const email = (
      process.env.OKTAE_ADMIN_EMAIL ||
      (await rl.question("Correo del administrador: "))
    )
      .trim()
      .toLowerCase();
    // La contraseña se lee desde una variable local para no mostrarla en pantalla.
    const password = process.env.OKTAE_ADMIN_PASSWORD || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 14)
      throw new Error(
        "Usa un correo válido y OKTAE_ADMIN_PASSWORD de al menos 14 caracteres.",
      );
    await db.connect();
    await db.query(
      "INSERT INTO oktae.users(email,password_hash,must_change_password) VALUES($1,$2,true)",
      [email, hashPassword(password)],
    );
    console.log(
      "Administrador creado. Debe cambiar su contraseña al ingresar por primera vez.",
    );
  } catch (e) {
    console.error(
      e instanceof Error && !("code" in e)
        ? e.message
        : "No se pudo crear el administrador (puede existir).",
    );
    process.exitCode = 1;
  } finally {
    rl.close();
    await db.end();
  }
}
void main();
