import {NextRequest,NextResponse,after} from "next/server";
import {equalSecret} from "@/lib/crm/whatsapp-protocol";
import {runWhatsappBot,botEnabled} from "@/lib/crm/whatsapp-bot";
import {runWhatsappSync} from "@/lib/crm/whatsapp-sync";
export const maxDuration=60;
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const token=process.env.WHATSAPP_N8N_TOKEN;
 if(!token||token.length<32)return NextResponse.json({error:"Integración no configurada."},{status:503});
 if(!equalSecret(req.headers.get("x-oktae-whatsapp-key")??"",token))return NextResponse.json({error:"No autorizado."},{status:401});
 try{after(async()=>{try{const synchronized=await runWhatsappSync();if(!synchronized)await runWhatsappBot();}catch{console.error("WhatsApp processing pending");}});return NextResponse.json({accepted:true,paused:!botEnabled()},{status:202,headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({error:"Procesamiento pendiente. Reintenta."},{status:503});}
}
