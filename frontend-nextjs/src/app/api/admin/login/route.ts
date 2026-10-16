import { jsonBody } from "@/lib/crm/http";
import { NextRequest, NextResponse } from "next/server";
import { checkOrigin, failure, HttpError } from "@/lib/crm/http";
import { db } from "@/lib/crm/db";
import { digest, createSession } from "@/lib/crm/auth";
import { hashPassword, verifyPassword } from "@/lib/crm/password";
const dummyHash = hashPassword("dummy-password-never-used-to-login");
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const body = await jsonBody(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    if (email.length > 254 || password.length > 512)
      throw new HttpError(400, "Datos inválidos.");
    const key = digest(email);
    const { rows: limits } = await db().query(
      `INSERT INTO oktae.login_attempts(identity_hash,attempts,reset_at) VALUES($1,1,now()+interval '15 minutes')
 ON CONFLICT(identity_hash) DO UPDATE SET attempts=CASE WHEN oktae.login_attempts.reset_at<now() THEN 1 ELSE oktae.login_attempts.attempts+1 END,
 reset_at=CASE WHEN oktae.login_attempts.reset_at<now() THEN now()+interval '15 minutes' ELSE oktae.login_attempts.reset_at END RETURNING attempts`,
      [key],
    );
    if (limits[0].attempts > 5)
      throw new HttpError(429, "Demasiados intentos. Espera 15 minutos.");
    const { rows } = await db().query(
      "SELECT id,password_hash,must_change_password,credential_version FROM oktae.users WHERE email=$1",
      [email],
    );
    const valid = verifyPassword(password, rows[0]?.password_hash || dummyHash);
    if (!rows[0] || !valid)
      throw new HttpError(401, "Correo o contraseña incorrectos.");
    await createSession(rows[0].id, rows[0].credential_version);
    await db().query(
      "DELETE FROM oktae.login_attempts WHERE identity_hash=$1",
      [key],
    );
    return NextResponse.json({
      ok: true,
      redirect: rows[0].must_change_password
        ? "/admin/change-password"
        : "/admin",
    });
  } catch (e) {
    return failure(e);
  }
}
