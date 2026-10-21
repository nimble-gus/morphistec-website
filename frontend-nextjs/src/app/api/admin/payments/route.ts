import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { authorized, failure, jsonBody } from "@/lib/crm/http";
import { createPayment } from "@/lib/crm/payments";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    return NextResponse.json((await db().query(`SELECT p.*,c.name,c.phone,
      COALESCE((SELECT jsonb_agg(h) FROM (SELECT amount_in_cents,currency,paid_at
       FROM oktae.subscription_charges WHERE payment_link_id=p.id ORDER BY paid_at DESC LIMIT 6) h),'[]'::jsonb) AS billing_history
      FROM oktae.payment_links p JOIN oktae.contacts c ON c.id=p.contact_id ORDER BY p.created_at DESC LIMIT 1000`)).rows);
  } catch (e) { return failure(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    return NextResponse.json(await createPayment(await jsonBody(req), user.id), {status:201});
  } catch (e) { return failure(e); }
}
