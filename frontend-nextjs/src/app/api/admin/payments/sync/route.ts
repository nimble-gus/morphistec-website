import { NextRequest, NextResponse } from "next/server";
import { authorized, failure, jsonBody, uuid } from "@/lib/crm/http";
import { syncSubscription } from "@/lib/crm/subscriptions";
export async function POST(req: NextRequest) {
  try {
    await authorized(req,true);
    await syncSubscription(uuid((await jsonBody(req)).id));
    return NextResponse.json({updated:true});
  } catch(e) { return failure(e); }
}
