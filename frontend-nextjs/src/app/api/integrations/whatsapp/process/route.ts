import {NextRequest,NextResponse,after} from "next/server";
import {equalSecret} from "@/lib/crm/whatsapp-protocol";
import {runWhatsappBot,botEnabled} from "@/lib/crm/whatsapp-bot";
export const maxDuration=60;
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const token=process.env.WHATSAPP_N8N_TOKEN;
 if(!token||token.length<32)return NextResponse.json({error:"Integración no configurada."},{status:503});
 if(!equalSecret(req.headers.get("x-oktae-whatsapp-key")??"",token))return NextResponse.json({error:"No autorizado."},{status:401});
 try{if(!botEnabled())return NextResponse.json({paused:true});after(async()=>{try{await runWhatsappBot();}catch{console.error("WhatsApp processing pending");}});return NextResponse.json({accepted:true},{status:202,headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({error:"Procesamiento pendiente. Reintenta."},{status:503});}
}
