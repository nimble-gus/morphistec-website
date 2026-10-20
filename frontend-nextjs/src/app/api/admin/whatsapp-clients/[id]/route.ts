import { NextRequest, NextResponse } from "next/server";
import {
  authorized,
  failure,
  jsonBody,
  text,
  uuid,
  HttpError,
} from "@/lib/crm/http";
import {
  clientDetail,
  saveClient,
  inviteClient,
  getClient,
} from "@/lib/crm/wa-clients";
import { setClientState, testClientAgent } from "@/lib/crm/wa-client-agent";
import { db } from "@/lib/crm/db";
type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Context) {
  try {
    await authorized(req);
    const id = uuid((await params).id),
      conversation = req.nextUrl.searchParams.get("conversation");
    if (conversation) {
      uuid(conversation);
      const { rows } = await db().query(
        "SELECT direction,body,status,received_at FROM oktae.wa_client_messages WHERE client_id=$1 AND conversation_id=$2 ORDER BY received_at DESC LIMIT 100",
        [id, conversation],
      );
      return NextResponse.json(rows.reverse(), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    return NextResponse.json(await clientDetail(id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const user = await authorized(req, true),
      id = uuid((await params).id);
    return NextResponse.json(
      await saveClient(await jsonBody(req), user.id, id),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest, { params }: Context) {
  try {
    const user = await authorized(req, true),
      id = uuid((await params).id),
      b = await jsonBody(req);
    if (b.action === "invite") {
      const client = await getClient(id);
      if (!/^[1-9][0-9]{7,14}$/.test(client.phone.replace(/\D/g, "")))
        throw new HttpError(
          400,
          "Guarda el número completo del cliente, con código de país.",
        );
      return NextResponse.json(await inviteClient(id, user.id));
    }
    if (b.action === "test")
      return NextResponse.json(
        await testClientAgent(id, text(b.message, 2000, true)),
      );
    if (b.action === "activate" || b.action === "pause") {
      await setClientState(id, b.action === "activate", user.id);
      return NextResponse.json({ saved: true });
    }
    if (b.action === "resume" || b.action === "pause_conversation") {
      const conversation = uuid(b.conversation);
      const c = await db().connect();
      try {
        await c.query("BEGIN");
        const r = await c.query(
          `UPDATE oktae.wa_client_conversations SET paused_until=${b.action === "resume" ? "NULL" : "now()+interval '24 hours'"},pause_reason=${b.action === "resume" ? "NULL" : "'manual'"} WHERE client_id=$1 AND id=$2 RETURNING id`,
          [id, conversation],
        );
        if (!r.rowCount)
          throw new HttpError(404, "Conversación no encontrada.");
        await c.query(
          "INSERT INTO oktae.wa_client_audit(client_id,user_id,action) VALUES($1,$2,$3)",
          [id, user.id, b.action],
        );
        await c.query("COMMIT");
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
      return NextResponse.json({ saved: true });
    }
    throw new HttpError(400, "Acción inválida.");
  } catch (e) {
    return failure(e);
  }
}
