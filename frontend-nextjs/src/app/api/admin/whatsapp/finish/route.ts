import { NextRequest, NextResponse } from "next/server";
import { authorized, failure, jsonBody } from "@/lib/crm/http";
import { finishWhatsappOnboarding } from "@/lib/crm/whatsapp";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    return NextResponse.json(await finishWhatsappOnboarding(user.id, await jsonBody(req)));
  } catch (error) { return failure(error); }
}
