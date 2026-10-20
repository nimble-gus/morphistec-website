import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/crm/db';
import {equalSecret} from '@/lib/crm/whatsapp-protocol';
import {saveInstagramSales} from '@/lib/crm/instagram-sales';
import {failure} from '@/lib/crm/http';
export const runtime='nodejs';
export async function POST(req:NextRequest){const token=process.env.WHATSAPP_N8N_TOKEN;
 if(!token||token.length<32||!equalSecret(req.headers.get('x-oktae-whatsapp-key')??'',token))return NextResponse.json({error:'No autorizado.'},{status:401});
 let client;try{const raw=await req.text();if(raw.length>50000)return NextResponse.json({error:'Solicitud demasiado grande.'},{status:413});const b=JSON.parse(raw);client=await db().connect();return NextResponse.json(await saveInstagramSales(client,b),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}finally{client?.release();}
}
