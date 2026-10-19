import {linkMessengerContext,salesContext,saveSalesReply} from "./whatsapp-sales";
import "server-only";
import {randomUUID} from "node:crypto";
import type {PoolClient} from "pg";
import {db} from "./db";
import {encryptionKey,openToken,GRAPH_VERSION} from "./whatsapp-protocol";
import {allowedAgentUrl,incomingTexts,humanEchoPeers,parseAgentAnswer,freshTimestamp} from "./whatsapp-bot-protocol";
export function botConfigured() {
 return allowedAgentUrl(process.env.WHATSAPP_N8N_WEBHOOK_URL)&&Boolean(process.env.WHATSAPP_N8N_TOKEN&&process.env.WHATSAPP_N8N_TOKEN.length>=32);
}
export function botEnabled(){return botConfigured()&&process.env.WHATSAPP_BOT_ENABLED==="true";}
export async function recordHumanEchoes(client:Pick<PoolClient,"query">,wabaId:string,value:Record<string,unknown>) {
 const linked=await client.query("SELECT phone_number_id FROM oktae.whatsapp_connections WHERE id=1 AND waba_id=$1",[wabaId]);
 const metadata=value.metadata as {phone_number_id?:string}|undefined;
 if(!linked.rowCount || metadata?.phone_number_id!==linked.rows[0].phone_number_id) return;
 for(const sender of humanEchoPeers(value)) {
  await client.query(`INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id,paused_until,pause_reason)
 VALUES($1,$2,now()+interval '6 hours','human') ON CONFLICT(waba_id,sender_id) DO UPDATE SET paused_until=now()+interval '6 hours',pause_reason='human'`,[wabaId,sender]);
  const echoes=(Array.isArray(value.message_echoes)?value.message_echoes:Array.isArray(value.messages)?value.messages:[]) as Array<{id?:string;to?:string;timestamp?:string;text?:{body?:string};type?:string}>;
  for(const echo of echoes)if(echo.to===sender&&typeof echo.id==="string"&&echo.id.length<=512&&freshTimestamp(echo.timestamp)){
   await client.query(`INSERT INTO oktae.conversation_messages(id,contact_id,waba_id,sender_id,channel,direction,body,created_at)
    SELECT $1,c.contact_id,$2,$3,'whatsapp','human',$4,$5 FROM oktae.whatsapp_conversations c WHERE c.waba_id=$2 AND c.sender_id=$3 ON CONFLICT DO NOTHING`,
    ['wa:human:'+echo.id,wabaId,sender,echo.text?.body?.slice(0,5000)||'[Mensaje '+(echo.type||'multimedia')+']',new Date(Number(echo.timestamp)*1000)]);
  }
 }
}
async function ingestEvents() {
 const client=await db().connect();
 try {
  await client.query("BEGIN");
  const connected=await client.query("SELECT waba_id,phone_number_id FROM oktae.whatsapp_connections WHERE id=1 AND status='linked_bot_paused'");
  if(!connected.rowCount){await client.query("ROLLBACK");return;}
  const connection=connected.rows[0];
  const {rows}=await client.query("SELECT event_key,field,payload,is_test FROM oktae.whatsapp_events WHERE processed_at IS NULL AND waba_id=$1 ORDER BY received_at LIMIT 40 FOR UPDATE SKIP LOCKED",[connection.waba_id]);
  for(const event of rows) {
   if(!event.is_test&&event.payload?.metadata?.phone_number_id===connection.phone_number_id) {
    if(event.field==="smb_message_echoes") await recordHumanEchoes(client,connection.waba_id,event.payload);
    if(event.field==="messages") for(const m of incomingTexts(event.payload)) {
     await client.query(`INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id,profile_name,last_customer_at)
      VALUES($1,$2,$3,$4) ON CONFLICT(waba_id,sender_id) DO UPDATE SET profile_name=CASE WHEN EXCLUDED.profile_name<>'' THEN EXCLUDED.profile_name ELSE oktae.whatsapp_conversations.profile_name END,last_customer_at=GREATEST(oktae.whatsapp_conversations.last_customer_at,EXCLUDED.last_customer_at)`,[connection.waba_id,m.sender,m.profile,m.date]);
     await linkMessengerContext(client,connection.waba_id,m.sender,m.text);
     await client.query(`INSERT INTO oktae.conversation_messages(id,contact_id,waba_id,sender_id,channel,direction,body,created_at)
      SELECT $1,c.contact_id,$2,$3,'whatsapp','customer',$4,$5 FROM oktae.whatsapp_conversations c WHERE c.waba_id=$2 AND c.sender_id=$3 ON CONFLICT DO NOTHING`,['wa:in:'+m.id,connection.waba_id,m.sender,m.text,m.date]);
     await client.query("INSERT INTO oktae.whatsapp_jobs(message_id,waba_id,sender_id,text_body,received_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",[m.id,connection.waba_id,m.sender,m.text,m.date]);
    }
   }
   // History, contacts, status receipts and samples never go to the AI or qualify leads.
   await client.query("UPDATE oktae.whatsapp_events SET processed_at=now() WHERE event_key=$1",[event.event_key]);
  }
  await client.query("COMMIT");
 } catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
}
async function claimJob() {
 const client=await db().connect();
 try {
  await client.query("BEGIN");
  // Expired leases are safe to retry only before an outbound send was attempted.
  await client.query("UPDATE oktae.whatsapp_jobs SET status=CASE WHEN attempts<3 THEN 'queued' ELSE 'failed' END,lease_id=NULL,lease_until=NULL WHERE status='processing' AND lease_until<now()");
  const selected=await client.query(`SELECT j.* FROM oktae.whatsapp_jobs j JOIN oktae.whatsapp_connections c ON c.waba_id=j.waba_id AND c.id=1 AND c.status='linked_bot_paused'
   WHERE j.status='queued' AND j.attempts<3 AND (j.attempts=0 OR j.updated_at<now()-interval '30 seconds') AND NOT EXISTS(SELECT 1 FROM oktae.whatsapp_jobs other WHERE other.waba_id=j.waba_id AND other.sender_id=j.sender_id AND (other.status='processing' OR (other.status='send_uncertain' AND other.updated_at>now()-interval '2 minutes')))
   ORDER BY j.created_at LIMIT 1 FOR UPDATE OF j SKIP LOCKED`);
  if(!selected.rowCount){await client.query("COMMIT");return null;}
  const job=selected.rows[0];
  // Serialize claims per conversation even when separate webhook invocations overlap.
  const conversation=await client.query("SELECT paused_until FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2 FOR UPDATE",[job.waba_id,job.sender_id]);
  const overlap=await client.query("SELECT 1 FROM oktae.whatsapp_jobs WHERE waba_id=$1 AND sender_id=$2 AND (status='processing' OR (status='send_uncertain' AND updated_at>now()-interval '2 minutes'))",[job.waba_id,job.sender_id]);
  if(overlap.rowCount){await client.query("ROLLBACK");return null;}
  const paused=conversation.rows[0]?.paused_until&&new Date(conversation.rows[0].paused_until).getTime()>Date.now();
  if(paused||new Date(job.received_at).getTime()<Date.now()-24*3600*1000) {
   await client.query("UPDATE oktae.whatsapp_jobs SET status='skipped',updated_at=now() WHERE message_id=$1",[job.message_id]);await client.query("COMMIT");return {skipped:true} as const;
  }
  const lease=randomUUID();
  await client.query("UPDATE oktae.whatsapp_jobs SET status='processing',attempts=attempts+1,lease_id=$2,lease_until=now()+interval '90 seconds',updated_at=now() WHERE message_id=$1",[job.message_id,lease]);
  await client.query("COMMIT");return {...job,lease,skipped:false};
 } catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
}
async function processOne() {
 const job=await claimJob();if(!job)return false;if(job.skipped)return true;
 try {
  const ai=await fetch(process.env.WHATSAPP_N8N_WEBHOOK_URL!,{method:"POST",headers:{"Content-Type":"application/json","X-Oktae-WhatsApp-Key":process.env.WHATSAPP_N8N_TOKEN!},body:JSON.stringify({text:job.text_body,sales_context:await salesContext(job.waba_id,job.sender_id),session_key:`wa:${job.waba_id}:${job.sender_id}`}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
  if(!ai.ok)throw new Error("Agent unavailable");
  const raw=await ai.text();if(raw.length>15000)throw new Error("Agent response too large");
  const answer=parseAgentAnswer(JSON.parse(raw));
  const connection=(await db().query("SELECT waba_id,phone_number_id,token_encrypted,token_expires_at,connected_by FROM oktae.whatsapp_connections WHERE id=1 AND waba_id=$1 AND status='linked_bot_paused'",[job.waba_id])).rows[0];
  if(!connection||new Date(connection.token_expires_at).getTime()<=Date.now())throw new Error("Connection expired");
  const token=openToken(connection.token_encrypted,encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY),connection.waba_id);
  // Recheck human pause and service window after the AI returns, before any send.
  const ready=await db().query(`UPDATE oktae.whatsapp_jobs j SET status='send_uncertain',updated_at=now()
   FROM oktae.whatsapp_conversations c WHERE j.message_id=$1 AND j.lease_id=$2 AND j.status='processing' AND c.waba_id=j.waba_id AND c.sender_id=j.sender_id AND (c.paused_until IS NULL OR c.paused_until<=now()) AND c.last_customer_at>now()-interval '24 hours' RETURNING j.message_id`,[job.message_id,job.lease]);
  if(!ready.rowCount){await db().query("UPDATE oktae.whatsapp_jobs SET status='skipped',updated_at=now() WHERE message_id=$1 AND lease_id=$2 AND status='processing'",[job.message_id,job.lease]);return true;}
  // Marked uncertain before calling Meta: never resend automatically after a timeout.
  const sent=await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${connection.phone_number_id}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",to:job.sender_id,type:"text",text:{body:answer.reply}}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  const receipt=await sent.json().catch(()=>null);
  if(!sent.ok||typeof receipt?.messages?.[0]?.id!=="string") {
   if(sent.status>=400&&sent.status<500)await db().query("UPDATE oktae.whatsapp_jobs SET status='failed',updated_at=now() WHERE message_id=$1 AND lease_id=$2",[job.message_id,job.lease]);
   return true;
  }
  const client=await db().connect();
  try {
   await client.query("BEGIN");
   await client.query("UPDATE oktae.whatsapp_jobs SET status='answered',response_message_id=$3,updated_at=now() WHERE message_id=$1 AND lease_id=$2",[job.message_id,job.lease,receipt.messages[0].id]);
   const conversation=(await client.query("SELECT profile_name,contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2 FOR UPDATE",[job.waba_id,job.sender_id])).rows[0];
   if(answer.qualified&&!conversation.contact_id) {
    const contact=(await client.query("INSERT INTO oktae.contacts(name,company,phone,stage,source) VALUES($1,$2,$3,'contactado','whatsapp') RETURNING id",[answer.name||conversation.profile_name||`Consulta WhatsApp ${job.sender_id.slice(-4)}`,answer.company,job.sender_id])).rows[0];
    await client.query("UPDATE oktae.whatsapp_conversations SET contact_id=$3 WHERE waba_id=$1 AND sender_id=$2",[job.waba_id,job.sender_id,contact.id]);
    await client.query("INSERT INTO oktae.notes(contact_id,body,created_by) VALUES($1,$2,$3)",[contact.id,`Interés comercial expresado en WhatsApp: ${answer.interest}`,connection.connected_by]);
   }
   await saveSalesReply(client,job,answer,connection.connected_by);
   if(answer.handoff)await client.query("UPDATE oktae.whatsapp_conversations SET paused_until=now()+interval '24 hours',pause_reason='handoff' WHERE waba_id=$1 AND sender_id=$2",[job.waba_id,job.sender_id]);
   await client.query("COMMIT");
  }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 }catch{
  await db().query("UPDATE oktae.whatsapp_jobs SET status=CASE WHEN attempts<3 THEN 'queued' ELSE 'failed' END,updated_at=now(),lease_id=NULL,lease_until=NULL WHERE message_id=$1 AND lease_id=$2 AND status='processing'",[job.message_id,job.lease]);
 }
 return true;
}
export async function runWhatsappBot() {
 if(!botEnabled())return {paused:true,processed:0};
 await ingestEvents();
 const started=Date.now();let processed=0;
 while(processed<3&&Date.now()-started<20000){if(!await processOne())break;processed++;}
 return {paused:false,processed};
}

export async function verifyAgentReady(){
 if(!botConfigured())throw new Error("Agent not configured");
 const r=await fetch(process.env.WHATSAPP_N8N_WEBHOOK_URL!,{method:"POST",headers:{"Content-Type":"application/json","X-Oktae-WhatsApp-Key":process.env.WHATSAPP_N8N_TOKEN!},body:JSON.stringify({healthcheck:true}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
 if(!r.ok||(await r.json().catch(()=>null))?.ready!==true)throw new Error("Agent not ready");
}
