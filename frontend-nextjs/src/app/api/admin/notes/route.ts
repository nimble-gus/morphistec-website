import { jsonBody } from "@/lib/crm/http";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { authorized, failure, text, uuid } from "@/lib/crm/http";
import { contactHistory, historyPage } from "@/lib/crm/contact-history";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    const id = uuid(req.nextUrl.searchParams.get("contact_id"));
    const result = await contactHistory(id,historyPage(req.nextUrl.searchParams.get("page")));
    // Older integrations read the array; the CRM requests the paginated envelope.
    return NextResponse.json(req.nextUrl.searchParams.has("page") ? result : result.items);
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
