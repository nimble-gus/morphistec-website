import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authorized, failure, HttpError, jsonBody } from "@/lib/crm/http";
import { db } from "@/lib/crm/db";
import { digest, setSessionCookie } from "@/lib/crm/auth";
import { hashPassword, verifyPassword } from "@/lib/crm/password";
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true, true);
    const b = await jsonBody(req);
    const {
      current_password: current,
      new_password: password,
      confirm_password: confirm,
    } = b;
    if (
      typeof current !== "string" ||
      current.length > 512 ||
      typeof password !== "string" ||
      password.length < 14 ||
      password.length > 512
    )
      throw new HttpError(
        400,
        "Usa una contraseña nueva de 14 a 512 caracteres.",
      );
    if (password !== confirm)
      throw new HttpError(400, "Las contraseñas nuevas no coinciden.");
    if (password === current)
      throw new HttpError(
        400,
        "La contraseña nueva debe ser diferente de la inicial.",
      );
    const limitKey = digest("password-change:" + user.id);
    const limit = await db().query(
      `INSERT INTO oktae.login_attempts(identity_hash,attempts,reset_at) VALUES($1,1,now()+interval '15 minutes')
 ON CONFLICT(identity_hash) DO UPDATE SET attempts=CASE WHEN oktae.login_attempts.reset_at<now() THEN 1 ELSE oktae.login_attempts.attempts+1 END,
 reset_at=CASE WHEN oktae.login_attempts.reset_at<now() THEN now()+interval '15 minutes' ELSE oktae.login_attempts.reset_at END RETURNING attempts`,
      [limitKey],
    );
    if (limit.rows[0].attempts > 5)
      throw new HttpError(429, "Demasiados intentos. Espera 15 minutos.");
    const client = await db().connect();
    const token = randomBytes(32).toString("hex");
    try {
      await client.query("BEGIN");
      const row = (
        await client.query(
          "SELECT password_hash,credential_version FROM oktae.users WHERE id=$1 FOR UPDATE",
          [user.id],
        )
      ).rows[0];
      if (!row || !verifyPassword(current, row.password_hash))
        throw new HttpError(401, "La contraseña actual no es correcta.");
      await client.query(
        "UPDATE oktae.users SET password_hash=$2,must_change_password=false,credential_version=credential_version+1 WHERE id=$1",
        [user.id, hashPassword(password)],
      );
      await client.query("DELETE FROM oktae.sessions WHERE user_id=$1", [
        user.id,
      ]);
      await client.query(
        "INSERT INTO oktae.sessions(token_hash,user_id,expires_at,credential_version) VALUES($1,$2,now()+interval '8 hours',$3)",
        [digest(token), user.id, row.credential_version + 1],
      );
      await client.query(
        "DELETE FROM oktae.login_attempts WHERE identity_hash=$1",
        [limitKey],
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
