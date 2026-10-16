import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { HttpError } from "@/lib/crm/errors";
import {
  parseMessengerBatch,
  syncMessengerBatch,
  validSyncToken,
} from "@/lib/crm/messenger";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const expected = process.env.CRM_MESSENGER_SYNC_TOKEN;
  if (!expected || expected.length < 32)
    return NextResponse.json(
      { error: "Integración no configurada." },
      { status: 503 },
    );
  if (!validSyncToken(req.headers.get("authorization"), expected))
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  let client;
  try {
    const reader = req.body?.getReader();
    if (!reader) throw new HttpError(400, "Cuerpo requerido.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2097152) {
        await reader.cancel();
        throw new HttpError(413, "Lote demasiado grande.");
      }
      chunks.push(value);
    }
    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new HttpError(400, "JSON inválido.");
    }
    const batch = parseMessengerBatch(payload);
    client = await db().connect();
    return NextResponse.json(await syncMessengerBatch(client, batch), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof HttpError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(
      "Messenger sync failed",
      e && typeof e === "object" && "code" in e ? e.code : "internal",
    );
    return NextResponse.json(
      { error: "No se pudo sincronizar. Reintenta el lote." },
      { status: 503 },
    );
  } finally {
    client?.release();
  }
}
