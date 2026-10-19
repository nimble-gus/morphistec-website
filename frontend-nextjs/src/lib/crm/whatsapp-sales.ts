import type {PoolClient} from 'pg';
import {db} from './db';
import {handoffCode,supportedDemoTime} from './sales-protocol';
import type {parseAgentAnswer} from './whatsapp-bot-protocol';
export async function linkMessengerContext(client:Pick<PoolClient,'query'>,waba:string,sender:string,text:string){
 const code=handoffCode(text);if(!code)return;
 const h=await client.query(`SELECT contact_id FROM oktae.messenger_handoffs
 WHERE code=$1 AND expires_at>now() AND (claimed_sender IS NULL OR (claimed_sender=$2 AND claimed_waba=$3)) FOR UPDATE`,[code,sender,waba]);
 if(!h.rowCount)return;
 const existing=await client.query('SELECT contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2 FOR UPDATE',[waba,sender]);
 if(existing.rows[0]?.contact_id&&existing.rows[0].contact_id!==h.rows[0].contact_id)return;
 await client.query('UPDATE oktae.messenger_handoffs SET claimed_sender=$2,claimed_waba=$3 WHERE code=$1',[code,sender,waba]);
 await client.query('UPDATE oktae.whatsapp_conversations SET contact_id=$3,handoff_code=$4 WHERE waba_id=$1 AND sender_id=$2',[waba,sender,h.rows[0].contact_id,code]);
 await client.query('UPDATE oktae.conversation_messages SET contact_id=$3 WHERE waba_id=$1 AND sender_id=$2 AND contact_id IS NULL',[waba,sender,h.rows[0].contact_id]);
}
export async function salesContext(waba:string,sender:string){
 const c=(await db().query(`SELECT c.id,c.name,c.company,c.stage,left(m.interest,1500) AS interest FROM oktae.whatsapp_conversations w
 JOIN oktae.contacts c ON c.id=w.contact_id LEFT JOIN oktae.messenger_leads m ON m.contact_id=c.id
 WHERE w.waba_id=$1 AND w.sender_id=$2`,[waba,sender])).rows[0];
 const messages=c?(await db().query(`SELECT channel,direction,left(body,1000) AS body FROM oktae.conversation_messages
 WHERE contact_id=$1 AND delivery<>'prepared' ORDER BY created_at DESC,id DESC LIMIT 12`,[c.id])).rows.reverse():[];
 const demos=c?(await db().query('SELECT preferred_time,status FROM oktae.demo_requests WHERE contact_id=$1 ORDER BY created_at DESC LIMIT 1',[c.id])).rows:[];
 return JSON.stringify({now:new Date().toISOString(),timezone:'America/Guatemala',contact:c?{name:c.name,company:c.company,interest:c.interest,stage:c.stage}:null,recent_messages:messages,latest_demo_request:demos[0]??null,booking_policy:'15 minutos. Horario sujeto a confirmación manual de Gustavo. Sin calendario conectado. Pago enviado manualmente después de la demo.'});
}
export async function saveSalesReply(client:Pick<PoolClient,'query'>,job:{message_id:string;waba_id:string;sender_id:string},answer:ReturnType<typeof parseAgentAnswer>,userId:string){
 const contact=(await client.query('SELECT contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2 FOR UPDATE',[job.waba_id,job.sender_id])).rows[0]?.contact_id;
 const archived=await client.query(`INSERT INTO oktae.conversation_messages(id,contact_id,waba_id,sender_id,channel,direction,body,delivery)
 VALUES($1,$2,$3,$4,'whatsapp','assistant',$5,'accepted') ON CONFLICT DO NOTHING RETURNING id`,['wa:out:'+job.message_id,contact,job.waba_id,job.sender_id,answer.reply]);
 if(!archived.rowCount||!contact)return;
 await client.query('UPDATE oktae.conversation_messages SET contact_id=$3 WHERE waba_id=$1 AND sender_id=$2 AND contact_id IS NULL',[job.waba_id,job.sender_id,contact]);
 if(answer.summary)await client.query('INSERT INTO oktae.notes(contact_id,body,created_by) VALUES($1,$2,$3)',[contact,'Seguimiento WhatsApp: '+answer.summary,userId]);
 if(answer.demoRequested&&answer.preferredTime){
  const texts=(await client.query("SELECT body FROM oktae.conversation_messages WHERE waba_id=$1 AND sender_id=$2 AND direction='customer' ORDER BY created_at DESC LIMIT 20",[job.waba_id,job.sender_id])).rows.map(r=>r.body);
  if(supportedDemoTime(answer.preferredTime,texts)){
   const saved=await client.query('INSERT INTO oktae.demo_requests(contact_id,source_message_id,preferred_time) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id',[contact,job.message_id,answer.preferredTime]);
   if(saved.rowCount)await client.query('INSERT INTO oktae.notes(contact_id,body,created_by) VALUES($1,$2,$3)',[contact,`Demo de 15 minutos solicitada: ${answer.preferredTime}. Zona horaria de referencia: America/Guatemala; confirmar con el cliente. PENDIENTE DE CONFIRMACIÓN DE GUSTAVO. El link de pago se envía manualmente después de la demo.`,userId]);
  }
 }
}
