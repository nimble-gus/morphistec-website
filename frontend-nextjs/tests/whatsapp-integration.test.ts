import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import pg from "pg";
import { NextRequest } from "next/server";
import { finishWhatsappOnboarding, beginWhatsappOnboarding } from "../src/lib/crm/whatsapp";
import {runWhatsappSync} from "../src/lib/crm/whatsapp-sync";
import { openToken } from "../src/lib/crm/whatsapp-protocol";
import { GET, POST } from "../src/app/api/webhooks/whatsapp/route";
try { process.loadEnvFile(".env"); } catch {}

test("onboarding consumes nonce once, validates number and coexistence, encrypts the saved token; signed events deduplicate", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL required for integration test");
  const client = new pg.Client({connectionString:process.env.DATABASE_URL});
  await client.connect();
  const originalFetch = globalThis.fetch;
  const key=randomBytes(32), secret="test-app-secret", verify=randomBytes(32).toString("hex");
  process.env.WHATSAPP_ONBOARDING_ENABLED="true";
  process.env.WHATSAPP_BOT_ENABLED="false";
  process.env.WHATSAPP_N8N_TOKEN=randomBytes(32).toString("hex");
  process.env.WHATSAPP_N8N_WEBHOOK_URL="https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai";
  process.env.META_APP_SECRET=secret;
  process.env.WHATSAPP_ENCRYPTION_KEY=key.toString("hex");
  process.env.WHATSAPP_VERIFY_TOKEN=verify;
  const calls: string[]=[];
  let syncTimeout=false;
  let coexistence=true, phone="+502 3117 4640";
  const waba="1786565612453704", phoneId="123456789012345", fakeToken="test-token-never-issued-by-meta";
  // Every Graph call is intercepted. No real authorization, send or registration occurs.
  globalThis.fetch=async (input,init) => {
    const url=new URL(String(input));
    if(url.href===process.env.WHATSAPP_N8N_WEBHOOK_URL){assert.equal(JSON.parse(String(init?.body)).healthcheck,true);return Response.json({ready:true});}
    assert.equal(url.hostname,"graph.facebook.com");
    calls.push(url.pathname);
    if(url.pathname.endsWith("/oauth/access_token")) return Response.json({access_token:fakeToken,expires_in:3600});
    assert.equal(new Headers(init?.headers).get("Authorization"),`Bearer ${fakeToken}`);
    if(url.pathname.endsWith(`/${waba}/phone_numbers`)) return Response.json({data:[{id:phoneId,display_phone_number:phone}]});
    if(url.pathname.endsWith(`/${phoneId}`)) return Response.json({is_on_biz_app:coexistence,platform_type:"CLOUD_API"});
    if(url.pathname.endsWith(`/${waba}/subscribed_apps`)) {assert.equal(init?.method,"POST");return Response.json({success:true});}
    if(url.pathname.endsWith(`/${phoneId}/smb_app_data`)) {if(syncTimeout)throw new Error("Ambiguous timeout");const b=JSON.parse(String(init?.body));assert.equal(b.messaging_product,"whatsapp");return Response.json({request_id:`request-${b.sync_type}`});}
    throw new Error("Unexpected Graph operation");
  };
  let pendingQuery: Promise<unknown>=Promise.resolve();
  const serializedQuery=(sql:string,values?:unknown[])=>{const task=pendingQuery.then(()=>client.query(sql,values));pendingQuery=task.then(()=>undefined,()=>undefined);return task;};
  (globalThis as unknown as {oktaePool:unknown}).oktaePool={query:serializedQuery};
  try {
    await client.query("BEGIN");
    const userId=randomUUID();
    await client.query("INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'not-a-valid-password-hash')",[userId,`wa-test-${userId}@example.invalid`]);
    await client.query("UPDATE oktae.whatsapp_setup SET webhook_verified_at=NULL WHERE id=1");
    await assert.rejects(()=>beginWhatsappOnboarding(userId),/Primero verifica/);
    const invalidGet=await GET(new NextRequest(`https://www.oktae.tech/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1234`));
    assert.equal(invalidGet.status,403);
    const verified=await GET(new NextRequest(`https://www.oktae.tech/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${verify}&hub.challenge=1234`));
    assert.equal(await verified.text(),"1234");
    const {nonce}=await beginWhatsappOnboarding(userId);
    const body={nonce,code:"fake-code-for-tests-only",wabaId:waba,event:"FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",syncConsent:true};
    coexistence=false;
    await assert.rejects(()=>finishWhatsappOnboarding(userId,body),/no confirma coexistencia/);
    const countCalls=calls.length;
    await assert.rejects(()=>finishWhatsappOnboarding(userId,body),/ya se utilizó/);
    assert.equal(calls.length,countCalls,"replayed nonce must not call Meta");
    coexistence=true;phone="+502 5555 5555";
    const second=await beginWhatsappOnboarding(userId);
    await assert.rejects(()=>finishWhatsappOnboarding(userId,{...body,nonce:second.nonce}),/contiene \+502 3117 4640/);
    phone="+502 3117 4640";
    const third=await beginWhatsappOnboarding(userId);
    assert.deepEqual(await finishWhatsappOnboarding(userId,{...body,nonce:third.nonce}),{linked:true,botActive:false});
    const connection=(await client.query("SELECT token_encrypted,status FROM oktae.whatsapp_connections WHERE id=1")).rows[0];
    assert.equal(connection.status,"sync_pending");
    assert.equal(connection.token_encrypted.includes(fakeToken),false);
    assert.equal(openToken(connection.token_encrypted,key,waba),fakeToken);
    assert.equal(calls.some(path=>/\/(register|deregister|messages|smb_app_data)$/.test(path)),false);
    const beforeSync=calls.length;
    await runWhatsappSync();
    assert.equal(calls.length,beforeSync+2);
    assert.equal((await client.query("SELECT status FROM oktae.whatsapp_connections WHERE id=1")).rows[0].status,"linked_bot_paused");
    await runWhatsappSync();assert.equal(calls.length,beforeSync+2,"accepted sync requests must never repeat");
    await client.query("UPDATE oktae.whatsapp_sync_requests SET status='pending',request_id=NULL WHERE phone_number_id=$1 AND sync_type='history'",[phoneId]);
    await client.query("UPDATE oktae.whatsapp_connections SET status='sync_pending' WHERE id=1");
    syncTimeout=true;await runWhatsappSync();const afterTimeout=calls.length;await runWhatsappSync();
    assert.equal(calls.length,afterTimeout,"ambiguous synchronization must not retry");
    assert.equal((await client.query("SELECT status FROM oktae.whatsapp_connections WHERE id=1")).rows[0].status,"sync_review");
    // Signed event receipt is exercised in a nested savepoint, preserving all DB data.
    (globalThis as unknown as {oktaePool:unknown}).oktaePool={query:client.query.bind(client),connect:async()=>({
      query:async(sql:string,values?:unknown[])=>client.query(sql==="BEGIN"?"SAVEPOINT webhook_test":sql==="COMMIT"?"RELEASE SAVEPOINT webhook_test":sql==="ROLLBACK"?"ROLLBACK TO SAVEPOINT webhook_test":sql,values),release:()=>{}
    })};
    const raw=JSON.stringify({object:"whatsapp_business_account",entry:[{id:waba,changes:[{field:"messages",value:{metadata:{phone_number_id:phoneId},messages:[{id:`wamid.test-${randomUUID()}`,from:"50255555555",text:{body:"test only"}}]}}]}]});
    const signed="sha256="+createHmac("sha256",secret).update(raw).digest("hex");
    const request=(signature:string)=>new NextRequest("https://www.oktae.tech/api/webhooks/whatsapp",{method:"POST",headers:{"x-hub-signature-256":signature},body:raw});
    assert.equal((await POST(request("sha256="+"0".repeat(64)))).status,403);
    const before=Number((await client.query("SELECT count(*) AS count FROM oktae.whatsapp_events")).rows[0].count);
    assert.equal((await POST(request(signed))).status,200);
    assert.equal((await POST(request(signed))).status,200);
    const after=Number((await client.query("SELECT count(*) AS count FROM oktae.whatsapp_events")).rows[0].count);
    assert.equal(after,before+1,"duplicate delivery must not insert another event");
    const sample = JSON.parse(raw); sample.entry[0].id="0";
    const sampleRaw=JSON.stringify(sample);
    const sampleSignature="sha256="+createHmac("sha256",secret).update(sampleRaw).digest("hex");
    const sampleRequest=(signature:string)=>new NextRequest("https://www.oktae.tech/api/webhooks/whatsapp",{method:"POST",headers:{"x-hub-signature-256":signature},body:sampleRaw});
    assert.equal((await POST(sampleRequest("sha256="+"0".repeat(64)))).status,403);
    assert.equal((await POST(sampleRequest(sampleSignature))).status,200);
    const savedSample=await client.query("SELECT is_test FROM oktae.whatsapp_events WHERE waba_id='0' AND payload->'messages'->0->>'id'=$1",[sample.entry[0].changes[0].value.messages[0].id]);
    assert.equal(savedSample.rows[0].is_test,true);

  } finally {
    globalThis.fetch=originalFetch;
    await client.query("ROLLBACK");
    await client.end();
    delete (globalThis as unknown as {oktaePool?:unknown}).oktaePool;
  }
});
