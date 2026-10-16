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
    "SELECT u.id,u.email FROM oktae.sessions s JOIN oktae.users u ON u.id=s.user_id WHERE token_hash=$1 AND expires_at>now()",
    [digest(token)],
  );
  return (rows[0] as { id: string; email: string } | undefined) ?? null;
}
export async function requireUser() {
  const user = await session();
  if (!user) redirect("/admin/login");
  return user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db().query(
    "INSERT INTO oktae.sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",
    [digest(token), userId],
  );
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}
