import { NextRequest, NextResponse } from "next/server";
import { authorized, failure } from "@/lib/crm/http";
import { beginWhatsappOnboarding } from "@/lib/crm/whatsapp";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    return NextResponse.json(await beginWhatsappOnboarding(user.id));
  } catch (error) { return failure(error); }
}
