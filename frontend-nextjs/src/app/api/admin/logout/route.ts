import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/crm/db";
import { cookieName, digest } from "@/lib/crm/auth";
import { authorized, failure } from "@/lib/crm/http";
export async function POST(req: NextRequest) {
  try {
    await authorized(req, true, true);
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;
    if (token)
      await db().query("DELETE FROM oktae.sessions WHERE token_hash=$1", [
        digest(token),
      ]);
    jar.delete(cookieName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
