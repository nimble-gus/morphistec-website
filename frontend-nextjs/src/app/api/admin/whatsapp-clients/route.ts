import { NextRequest, NextResponse } from "next/server";
import { authorized, failure, jsonBody } from "@/lib/crm/http";
import { db } from "@/lib/crm/db";
import { saveClient } from "@/lib/crm/wa-clients";
export async function GET(req: NextRequest) {
  try {
    await authorized(req);
    const { rows } = await db().query(
      `SELECT c.id,c.name,c.contact_name,c.responsible,c.plan,c.status,c.updated_at,c.monthly_limit,n.display_phone_number,n.status AS connection_status,coalesce(u.sent,0)::integer AS sent FROM oktae.wa_clients c LEFT JOIN oktae.wa_client_connections n ON n.client_id=c.id LEFT JOIN oktae.wa_client_usage u ON u.client_id=c.id AND u.month=date_trunc('month',now() AT TIME ZONE 'UTC')::date ORDER BY c.updated_at DESC LIMIT 1000`,
    );
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    return NextResponse.json(await saveClient(await jsonBody(req), user.id), {
      status: 201,
    });
  } catch (e) {
    return failure(e);
  }
}
