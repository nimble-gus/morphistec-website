import {test} from "node:test";
import assert from "node:assert/strict";
import {randomBytes,randomUUID} from "node:crypto";
import pg from "pg";
import {sealToken} from "../src/lib/crm/whatsapp-protocol";
import {runWhatsappBot,recordHumanEchoes,verifyAgentReady} from "../src/lib/crm/whatsapp-bot";
try{process.loadEnvFile(".env");}catch{}
test("worker deduplicates, pauses for human replies, qualifies only intent, and never retries ambiguous sends",async()=>{
 assert.ok(process.env.DATABASE_URL);
 const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();
 const originalFetch=globalThis.fetch,key=randomBytes(32),waba="123456789123456",phoneId="234567891234567",sender="50255555555";
 const agentUrl="https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai",agentKey=randomBytes(32).toString("hex");
 process.env.WHATSAPP_N8N_WEBHOOK_URL=agentUrl;process.env.WHATSAPP_N8N_TOKEN=agentKey;process.env.WHATSAPP_BOT_ENABLED="true";process.env.WHATSAPP_ENCRYPTION_KEY=key.toString("hex");
 let sends=0,agentCalls=0,timeoutOnce=false,savepoint=0;
 const queries=client.query.bind(client);
 (globalThis as unknown as {oktaePool:unknown}).oktaePool={query:queries,connect:async()=>{const name=`bot_test_${++savepoint}`;return {query:(sql:string,values?:unknown[])=>client.query(sql==="BEGIN"?`SAVEPOINT ${name}`:sql==="COMMIT"?`RELEASE SAVEPOINT ${name}`:sql==="ROLLBACK"?`ROLLBACK TO SAVEPOINT ${name}`:sql,values),release:()=>{}};}};
 globalThis.fetch=async(input,init)=>{
  const url=String(input);
  if(url===agentUrl){assert.equal(new Headers(init?.headers).get("X-Oktae-WhatsApp-Key"),agentKey);const body=JSON.parse(String(init?.body));if(body.healthcheck)return Response.json({ready:true});agentCalls++;return Response.json({reply:"Gracias, te ayudamos con tu negocio.",qualification:{businessFit:true,commercialIntent:body.text.includes("demo"),interest:"Tienda para óptica",handoff:false}});}
  assert.equal(url,`https://graph.facebook.com/v26.0/${phoneId}/messages`);assert.equal(new Headers(init?.headers).get("Authorization"),"Bearer fake-meta-token");
  const body=JSON.parse(String(init?.body));assert.equal(body.to,sender);sends++;if(timeoutOnce){timeoutOnce=false;throw new Error("Simulated network timeout after dispatch");}
  return Response.json({messages:[{id:`wamid.out.${sends}`}]});
 };
 const record=async(text:string,field="messages",isTest=false)=>{
  const id=`wamid.in.${randomUUID()}`,payload={metadata:{phone_number_id:phoneId},contacts:[{wa_id:sender,profile:{name:"QA WhatsApp"}}],messages:[{id,from:sender,timestamp:String(Math.floor(Date.now()/1000)),type:"text",text:{body:text}}]};
  await client.query("INSERT INTO oktae.whatsapp_events(event_key,waba_id,field,payload,is_test) VALUES($1,$2,$3,$4,$5)",[randomUUID(),waba,field,payload,isTest]);return {id,payload};
 };
 try{
  await client.query("BEGIN");const userId=randomUUID();await client.query("INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'not-a-valid-password-hash')",[userId,`wa-worker-${userId}@example.invalid`]);
  await client.query(`INSERT INTO oktae.whatsapp_connections(id,waba_id,phone_number_id,display_phone_number,token_encrypted,token_expires_at,status,connected_by) VALUES(1,$1,$2,'+50231174640',$3,now()+interval '1 hour','linked_bot_paused',$4) ON CONFLICT(id) DO UPDATE SET waba_id=EXCLUDED.waba_id,phone_number_id=EXCLUDED.phone_number_id,token_encrypted=EXCLUDED.token_encrypted,token_expires_at=EXCLUDED.token_expires_at,status=EXCLUDED.status,connected_by=EXCLUDED.connected_by`,[waba,phoneId,sealToken("fake-meta-token",key,waba),userId]);
  await verifyAgentReady();
  const first=await record("Tengo una óptica");await runWhatsappBot();assert.equal(sends,1);assert.equal(agentCalls,1);
  assert.equal((await client.query("SELECT contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2",[waba,sender])).rows[0].contact_id,null);
  await client.query("INSERT INTO oktae.whatsapp_events(event_key,waba_id,field,payload) VALUES($1,$2,'messages',$3)",[randomUUID(),waba,first.payload]);await runWhatsappBot();assert.equal(sends,1,"same WAMID must not send twice");
  await record("Quiero una demo de ecommerce para la óptica");await runWhatsappBot();assert.equal(sends,2);
  const contactId=(await client.query("SELECT contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2",[waba,sender])).rows[0].contact_id;assert.ok(contactId);
  const contact=(await client.query("SELECT source,phone FROM oktae.contacts WHERE id=$1",[contactId])).rows[0];assert.equal(contact.source,"whatsapp");assert.equal(contact.phone,sender);
  await recordHumanEchoes(client,waba,{metadata:{phone_number_id:phoneId},message_echoes:[{to:sender,timestamp:String(Math.floor(Date.now()/1000))}]});
  const paused=await record("Otra pregunta mientras me atiende una persona");await runWhatsappBot();assert.equal(sends,2);assert.equal(agentCalls,2);assert.equal((await client.query("SELECT status FROM oktae.whatsapp_jobs WHERE message_id=$1",[paused.id])).rows[0].status,"skipped");
  await record("Historial que no se debe responder","history");await record("Muestra que no se debe responder","messages",true);await runWhatsappBot();assert.equal(agentCalls,2);
  await client.query("UPDATE oktae.whatsapp_conversations SET paused_until=NULL WHERE waba_id=$1 AND sender_id=$2",[waba,sender]);
  timeoutOnce=true;const ambiguous=await record("Nueva consulta");await runWhatsappBot();assert.equal(sends,3);assert.equal((await client.query("SELECT status FROM oktae.whatsapp_jobs WHERE message_id=$1",[ambiguous.id])).rows[0].status,"send_uncertain");
  await runWhatsappBot();assert.equal(sends,3,"a potentially delivered reply must not be retried");
  await client.query("UPDATE oktae.whatsapp_jobs SET updated_at=now()-interval '3 minutes' WHERE message_id=$1",[ambiguous.id]);
  await record("Otra consulta nueva después");await runWhatsappBot();assert.equal(sends,4,"new messages may continue without retrying the uncertain old reply");
 }finally{globalThis.fetch=originalFetch;await client.query("ROLLBACK");await client.end();delete(globalThis as unknown as {oktaePool?:unknown}).oktaePool;}
});
