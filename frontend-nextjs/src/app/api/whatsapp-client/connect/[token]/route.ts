import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkOrigin, failure, jsonBody } from "@/lib/crm/http";
import {
  prepareClientConnection,
  finishClientConnection,
} from "@/lib/crm/wa-client-connect";
export const runtime = "nodejs";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    checkOrigin(req);
    const { token } = await params;
    const b = await jsonBody(req);
    const jar = await cookies();
    const key = "oktae_wa_connect_" + token.slice(0, 12);
    if (b.action === "prepare") {
      const nonce = await prepareClientConnection(token);
      jar.set(key, nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1800,
        path: "/api/whatsapp-client/connect/" + token,
      });
      return NextResponse.json({ prepared: true });
    }
    const result = await finishClientConnection(
      token,
      jar.get(key)?.value ?? "",
      b,
    );
    jar.delete(key);
    return NextResponse.json(result);
  } catch (e) {
    return failure(e);
  }
}
