// Respond once to the latest exact PRUEBA OKTAE received by the verified number.
// Does not enable the bot, request history, or create CRM leads.
import pg from "pg";
import {randomUUID} from "node:crypto";
import {openToken,encryptionKey,GRAPH_VERSION} from "../src/lib/crm/whatsapp-protocol";
import {allowedAgentUrl,incomingTexts,parseAgentAnswer} from "../src/lib/crm/whatsapp-bot-protocol";
import {RECOVERY_WABA,RECOVERY_PHONE} from "./whatsapp-recovery-validation";
try{process.loadEnvFile(".env");}catch{}
async function main(){
 const url=process.env.WHATSAPP_N8N_WEBHOOK_URL;
 if(!allowedAgentUrl(url)||!process.env.WHATSAPP_N8N_TOKEN)throw new Error("Falta la configuración privada de n8n.");
 const db=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000,statement_timeout:15000});
 try{
  await db.connect();
  const connection=(await db.query("SELECT * FROM oktae.whatsapp_connections WHERE id=1 AND waba_id=$1 AND phone_number_id=$2 AND status='sync_review'",[RECOVERY_WABA,RECOVERY_PHONE])).rows[0];
  if(!connection||new Date(connection.token_expires_at).getTime()<Date.now()+120000)throw new Error("No hay una conexión de prueba vigente y pausada.");
  const events=(await db.query("SELECT payload FROM oktae.whatsapp_events WHERE waba_id=$1 AND field='messages' AND NOT is_test AND received_at>now()-interval '1 hour' ORDER BY received_at DESC LIMIT 20",[RECOVERY_WABA])).rows;
  const message=events.flatMap(e=>e.payload?.metadata?.phone_number_id===RECOVERY_PHONE?incomingTexts(e.payload):[]).find(m=>m.text.toUpperCase()==="PRUEBA OKTAE");
  if(!message)throw new Error("No se encontró el mensaje de prueba reciente.");
  if((await db.query("SELECT 1 FROM oktae.whatsapp_jobs WHERE message_id=$1",[message.id])).rowCount)throw new Error("La prueba ya tiene un intento registrado; no se reenviará.");
  const ai=await fetch(url!,{method:"POST",headers:{"Content-Type":"application/json","X-Oktae-WhatsApp-Key":process.env.WHATSAPP_N8N_TOKEN!},body:JSON.stringify({text:message.text,session_key:`wa:${RECOVERY_WABA}:${message.sender}`}),redirect:"error",signal:AbortSignal.timeout(25000)});
  if(!ai.ok)throw new Error("n8n rechazó la prueba. No se envió mensaje.");
  const raw=await ai.text();if(raw.length>15000)throw new Error("Respuesta del agente demasiado grande.");
  const answer=parseAgentAnswer(JSON.parse(raw));
  const lease=randomUUID();
  await db.query("BEGIN");
  const current=(await db.query("SELECT token_encrypted,token_expires_at,status FROM oktae.whatsapp_connections WHERE id=1 FOR UPDATE")).rows[0];
  if(current?.status!=="sync_review"||new Date(current.token_expires_at).getTime()<=Date.now())throw new Error("La conexión cambió o expiró; no se envió mensaje.");
  await db.query("INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id,last_customer_at) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",[RECOVERY_WABA,message.sender,message.date]);
  const human=(await db.query("SELECT 1 FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2 AND paused_until>now()",[RECOVERY_WABA,message.sender])).rowCount;
  if(human)throw new Error("La conversación tiene pausa de atención personal; no se envió mensaje.");
  const claimed=await db.query(`INSERT INTO oktae.whatsapp_jobs(message_id,waba_id,sender_id,text_body,received_at,status,attempts,lease_id,updated_at)
   VALUES($1,$2,$3,$4,$5,'send_uncertain',1,$6,now()) ON CONFLICT DO NOTHING RETURNING message_id`,[message.id,RECOVERY_WABA,message.sender,message.text,message.date,lease]);
  if(!claimed.rowCount)throw new Error("La prueba ya fue reclamada; no se reenviará.");
  const token=openToken(current.token_encrypted,encryptionKey(process.env.WHATSAPP_ENCRYPTION_KEY),RECOVERY_WABA);
  await db.query("COMMIT");
  const response=await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${RECOVERY_PHONE}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:message.sender,type:"text",text:{body:answer.reply}}),redirect:"error",signal:AbortSignal.timeout(12000)});
  const receipt=await response.json().catch(()=>null);
  if(!response.ok||typeof receipt?.messages?.[0]?.id!=="string"){
   if(response.status>=400&&response.status<500)await db.query("UPDATE oktae.whatsapp_jobs SET status='failed',updated_at=now() WHERE message_id=$1 AND lease_id=$2",[message.id,lease]);
   console.log(JSON.stringify({sent:false,httpStatus:response.status,metaCode:typeof receipt?.error?.code==='number'?receipt.error.code:null,automaticRetry:false}));return;
  }
  await db.query("UPDATE oktae.whatsapp_jobs SET status='answered',response_message_id=$3,updated_at=now() WHERE message_id=$1 AND lease_id=$2",[message.id,lease,receipt.messages[0].id]);
  console.log(JSON.stringify({sent:true,metaAccepted:true,botStillPaused:true,reply:answer.reply}));
 }catch(error){await db.query("ROLLBACK").catch(()=>{});throw error;}finally{await db.end();}
}
void main().catch(error=>{console.error("No se completó la respuesta de prueba. El bot sigue pausado; revisar el intento antes de repetir.",error&&typeof error==='object'&&'code' in error?String(error.code):error instanceof SyntaxError?'agent_json_invalid':error instanceof Error?error.name:'unknown');process.exitCode=1;});
