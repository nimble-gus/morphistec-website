import { NextRequest, NextResponse, after } from "next/server";
import { authorized, failure, jsonBody } from "@/lib/crm/http";
import { finishWhatsappOnboarding } from "@/lib/crm/whatsapp";
import {runWhatsappSync} from "@/lib/crm/whatsapp-sync";
export const runtime = "nodejs";
export const maxDuration=60;
export async function POST(req: NextRequest) {
  try {
    const user = await authorized(req, true);
    const result=await finishWhatsappOnboarding(user.id, await jsonBody(req));
    after(async()=>{try{await runWhatsappSync();}catch{console.error("WhatsApp synchronization pending");}});
    return NextResponse.json(result);
  } catch (error) { return failure(error); }
}
