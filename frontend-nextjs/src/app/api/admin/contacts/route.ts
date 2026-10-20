import { jsonBody } from "@/lib/crm/http";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { authorized, failure, text, HttpError, uuid } from "@/lib/crm/http";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    const { rows } = await db().query(
      `SELECT c.*,COALESCE(m.interest,i.interest) AS messenger_interest,COALESCE(m.stage,i.stage) AS messenger_stage,COALESCE(m.last_contact_at,i.observed_at) AS messenger_last_contact_at
 FROM oktae.contacts c LEFT JOIN oktae.messenger_leads m ON m.contact_id=c.id LEFT JOIN oktae.instagram_leads i ON i.contact_id=c.id ORDER BY c.updated_at DESC LIMIT 1000`,
    );
    return NextResponse.json(rows);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    await authorized(req, true);
    const b = await jsonBody(req);
    const name = text(b.name, 120, true),
      company = text(b.company, 160),
      email = text(b.email, 254),
      phone = text(b.phone, 30),
      source = text(b.source, 80);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpError(400, "Revisa el correo.");
    if (phone && !/^\+?[0-9 ()-]{7,30}$/.test(phone))
      throw new HttpError(
        400,
        "Revisa el teléfono e incluye el código de país.",
      );
    const { rows } = await db().query(
      "INSERT INTO oktae.contacts(name,company,email,phone,source) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [name, company, email, phone, source || "manual"],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    await authorized(req, true);
    const b = await jsonBody(req);
    const id = uuid(b.id);
    const stage = text(b.stage, 30, true);
    if (
      ![
        "nuevo",
        "contactado",
        "demo",
        "propuesta",
        "ganado",
        "perdido",
      ].includes(stage)
    )
      throw new HttpError(400, "Etapa inválida.");
    const date = b.next_follow_up || null;
    if (
      date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)))
    )
      throw new HttpError(400, "Fecha inválida.");
    const name = text(b.name, 120, true),
      company = text(b.company, 160),
      email = text(b.email, 254),
      phone = text(b.phone, 30);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpError(400, "Revisa el correo.");
    if (phone && !/^\+?[0-9 ()-]{7,30}$/.test(phone))
      throw new HttpError(400, "Revisa el teléfono.");
    const { rows } = await db().query(
      "UPDATE oktae.contacts SET stage=$2,next_follow_up=$3,name=$4,company=$5,email=$6,phone=$7,updated_at=now() WHERE id=$1 RETURNING *",
      [id, stage, date, name, company, email, phone],
    );
    if (!rows[0]) throw new HttpError(404, "Prospecto no encontrado.");
    return NextResponse.json(rows[0]);
  } catch (e) {
    return failure(e);
  }
}
