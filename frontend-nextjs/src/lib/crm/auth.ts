import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
export const cookieName = "oktae_session";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function session() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await db().query(
    "SELECT u.id,u.email,u.must_change_password FROM oktae.sessions s JOIN oktae.users u ON u.id=s.user_id WHERE token_hash=$1 AND expires_at>now() AND s.credential_version=u.credential_version",
    [digest(token)],
  );
  return (
    (rows[0] as
      | { id: string; email: string; must_change_password: boolean }
      | undefined) ?? null
  );
}
export async function requireUser(allowPasswordChange = false) {
  const user = await session();
  if (!user) redirect("/admin/login");
  if (user.must_change_password && !allowPasswordChange)
    redirect("/admin/change-password");
  return user;
}
export async function createSession(userId: string, credentialVersion: number) {
  const token = randomBytes(32).toString("hex");
  await db().query(
    "INSERT INTO oktae.sessions(token_hash,user_id,expires_at,credential_version) VALUES($1,$2,now()+interval '8 hours',$3)",
    [digest(token), userId, credentialVersion],
  );
  await setSessionCookie(token);
}
export async function setSessionCookie(token: string) {
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}
