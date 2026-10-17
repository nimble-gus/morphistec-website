import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/crm/db";
import { equalSecret, validMetaSignature } from "@/lib/crm/whatsapp-protocol";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (!token || token.length < 32 || req.nextUrl.searchParams.get("hub.mode") !== "subscribe" || !equalSecret(req.nextUrl.searchParams.get("hub.verify_token") ?? "", token) || !challenge || !/^[a-zA-Z0-9_-]{1,200}$/.test(challenge)) return new NextResponse("Forbidden", { status: 403 });
  try {
    await db().query("UPDATE oktae.whatsapp_setup SET webhook_verified_at=now() WHERE id=1");
    return new NextResponse(challenge, { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
  } catch { return new NextResponse("Setup unavailable", { status: 503 }); }
}

export async function POST(req: NextRequest) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return new NextResponse("Setup unavailable", { status: 503 });
  // Vercel caps request bodies. Reject large bodies before parsing or storing them.
  const maxBytes = 4_000_000;
  if (Number(req.headers.get("content-length")) > maxBytes) return new NextResponse("Too large", { status: 413 });
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) return new NextResponse("Too large", { status: 413 });
  if (!validMetaSignature(raw, req.headers.get("x-hub-signature-256"), secret)) return new NextResponse("Forbidden", { status: 403 });
  let payload;
  try { payload = JSON.parse(raw); } catch { return new NextResponse("Invalid event", { status: 400 }); }
  if (payload?.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) return new NextResponse("Ignored");
  if (payload.entry.length > 100) return new NextResponse("Too many entries", { status: 413 });
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    for (const entry of payload.entry) {
      if (typeof entry.id !== "string" || !(entry.id === "0" || /^[0-9]{5,30}$/.test(entry.id)) || !Array.isArray(entry.changes) || entry.changes.length > 100) throw new Error("Invalid event");
      // Signed dashboard samples can identify their account as 0. Keep them
      // explicitly separate so a worker can never treat them as customer leads.
      const isTest = entry.id === "0";
      for (const change of entry.changes) {
        if (!change || typeof change.field !== "string" || change.field.length > 100 || !change.value || typeof change.value !== "object") throw new Error("Invalid change");
        const body = JSON.stringify(change.value);
        const eventKey = createHash("sha256").update(`${entry.id}:${change.field}:${body}`).digest("hex");
        await client.query("INSERT INTO oktae.whatsapp_events(event_key,waba_id,field,payload,is_test) VALUES($1,$2,$3,$4::jsonb,$5) ON CONFLICT DO NOTHING", [eventKey, entry.id, change.field, body, isTest]);
      }
    }
    await client.query("COMMIT");
    return new NextResponse("EVENT_RECEIVED");
  } catch {
    await client.query("ROLLBACK");
    return new NextResponse("Event not stored", { status: 503 });
  } finally { client.release(); }
}
