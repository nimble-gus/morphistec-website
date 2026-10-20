import { jsonBody } from "@/lib/crm/http";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { authorized, failure, text, uuid } from "@/lib/crm/http";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    const id = uuid(req.nextUrl.searchParams.get("contact_id"));
    return NextResponse.json(
      (
        await db().query(
          `SELECT id::text,body,created_at FROM oktae.notes WHERE contact_id=$1
 UNION ALL SELECT id,(CASE channel WHEN 'whatsapp' THEN 'WhatsApp' WHEN 'instagram' THEN 'Instagram' ELSE 'Messenger' END)||' · '||
 (CASE direction WHEN 'customer' THEN 'Cliente' WHEN 'assistant' THEN 'Asistente' ELSE 'Gustavo' END)||': '||body,created_at
 FROM oktae.conversation_messages WHERE contact_id=$1 AND delivery<>'prepared'
 ORDER BY created_at DESC`,
          [id],
        )
      ).rows,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    const b = await jsonBody(req);
    const { rows } = await db().query(
      "INSERT INTO oktae.notes(contact_id,body,created_by) VALUES($1,$2,$3) RETURNING id,body,created_at",
      [uuid(b.contact_id), text(b.body, 5000, true), user.id],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
