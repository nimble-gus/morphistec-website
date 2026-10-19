import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {db} from '@/lib/crm/db';
import {equalSecret} from '@/lib/crm/whatsapp-protocol';
import {parseMessengerBatch,syncMessengerBatch,messengerPageId} from '@/lib/crm/messenger';
import {transferOutput} from '@/lib/crm/sales-protocol';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 const key=process.env.WHATSAPP_N8N_TOKEN;
 if(!key||key.length<32||!equalSecret(req.headers.get('x-oktae-whatsapp-key')??'',key))return NextResponse.json({error:'No autorizado.'},{status:401});
 let client;
 try{
  const raw=await req.text();if(raw.length>50000)throw new Error('size');
  const b=JSON.parse(raw);
  if(typeof b.psid!=='string'||!/^\d{1,64}$/.test(b.psid)||typeof b.source_message_id!=='string'||!b.source_message_id||b.source_message_id.length>512)throw new Error('identity');
  const source=createHash('sha256').update(b.psid+':'+b.source_message_id).digest('hex');
  client=await db().connect();
  if(b.action==='ack'){
   if(typeof b.message_id!=='string'||!b.message_id||b.message_id.length>512)throw new Error('receipt');
   await client.query("UPDATE oktae.conversation_messages SET delivery='accepted' WHERE id=$1 AND channel='messenger' AND direction='assistant'",['ms:out:'+source]);
   return NextResponse.json({message_id:b.message_id});
  }
  if(typeof b.text!=='string'||!b.text.trim()||b.text.length>5000||typeof b.output!=='string'||!b.output.trim()||b.output.length>10000)throw new Error('message');
  const lead={...b.lead,page_id:messengerPageId,psid:b.psid,channel:'messenger'};
  await syncMessengerBatch(client,parseMessengerBatch({observed_at:new Date().toISOString(),leads:[lead]}));
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[messengerPageId+':'+b.psid]);
  const contact=(await client.query('SELECT contact_id FROM oktae.messenger_leads WHERE page_id=$1 AND psid=$2',[messengerPageId,b.psid])).rows[0]?.contact_id;
  if(!contact)throw new Error('contact');
  let output=b.output;
  if(/https:\/\/wa\.me\/50231174640(?:\?|\b)/.test(output)){
   const h=await client.query('INSERT INTO oktae.messenger_handoffs(contact_id,source_message_id) VALUES($1,$2) ON CONFLICT(source_message_id) DO UPDATE SET source_message_id=EXCLUDED.source_message_id RETURNING code',[contact,source]);
   output=transferOutput(output,h.rows[0].code);
  }
  await client.query("INSERT INTO oktae.conversation_messages(id,contact_id,channel,direction,body) VALUES($1,$2,'messenger','customer',$3) ON CONFLICT DO NOTHING",['ms:in:'+source,contact,b.text]);
  await client.query("INSERT INTO oktae.conversation_messages(id,contact_id,channel,direction,body,delivery) VALUES($1,$2,'messenger','assistant',$3,'prepared') ON CONFLICT DO NOTHING",['ms:out:'+source,contact,output]);
  output=(await client.query('SELECT body FROM oktae.conversation_messages WHERE id=$1',['ms:out:'+source])).rows[0].body;
  await client.query('COMMIT');
  return NextResponse.json({output},{headers:{'Cache-Control':'no-store'}});
 }catch{if(client)await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'No se pudo guardar la conversación.'},{status:503});}
 finally{client?.release();}
}
