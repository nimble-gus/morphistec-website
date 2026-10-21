import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { createPayment, paymentInput } from "../src/lib/crm/payments";
import { handleSubscriptionEvent, syncSubscription } from "../src/lib/crm/subscriptions";
import { POST as webhook } from "../src/app/api/webhooks/recurrente/route";
try { process.loadEnvFile(".env"); } catch {}

test("monthly licensing: fixed price, safe retries, signed events, renewals and lifecycle stay linked to the store",async()=>{
  const client=new pg.Client({connectionString:process.env.DATABASE_URL});
  await client.connect(); await client.query("BEGIN");
  const oldFetch=globalThis.fetch, oldEnv={...process.env};
  const globalDb=globalThis as unknown as {oktaePool?:unknown}; const beforePool=globalDb.oktaePool;
  let savepoint=0, checkouts=0, ambiguous=false;
  globalDb.oktaePool={query:client.query.bind(client),connect:async()=>{
    const name='billing_'+(++savepoint);
    return {query:(q:string,v?:unknown[])=>client.query(q==='BEGIN'?'SAVEPOINT '+name:q==='COMMIT'?'RELEASE SAVEPOINT '+name:q==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+name:q,v),release:()=>{}};
  }};
  process.env.RECURRENTE_SECRET_KEY='sk_test_synthetic_fixture';
  process.env.RECURRENTE_WEBHOOK_SECRET='whsec_'+randomBytes(32).toString('base64');
  const uid=randomUUID(), cid=randomUUID();
  const remoteCheckouts=new Map<string,any>(), subscriptions=new Map<string,any>(), intents=new Map<string,any>();
  globalThis.fetch=async(input,init)=>{
    const url=new URL(String(input));
    assert.equal(url.origin,'https://app.recurrente.com');
    if(url.pathname==='/api/checkouts'&&init?.method==='POST'){
      checkouts++;
      if(ambiguous) throw new Error('synthetic timeout');
      const body=JSON.parse(String(init.body));const item=body.items[0];
      if(item.charge_type==='recurring'){
        assert.equal(item.amount_in_cents,4900);assert.equal(item.currency,'USD');
        assert.equal(item.billing_interval,'month');assert.equal(item.billing_interval_count,1);
        assert.deepEqual(item.payment_method_types,['card']);assert.equal(item.free_trial_interval,undefined);
      }
      const id='ch_'+randomBytes(8).toString('hex');
      const result={id,checkout_url:'https://app.recurrente.com/checkout-session/'+id,status:'unpaid',metadata:body.metadata};
      remoteCheckouts.set(id,result);return Response.json(result);
    }
    const id=url.pathname.split('/').at(-1)!;
    if(url.pathname.startsWith('/api/subscriptions/')) return Response.json(subscriptions.get(id));
    if(url.pathname.startsWith('/api/checkouts/')) return Response.json(remoteCheckouts.get(id));
    if(url.pathname.startsWith('/api/intents/')) return Response.json(intents.get(id));
    throw new Error('Unexpected external request '+url.pathname);
  };
  try{
    await client.query("INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'no-login-test-fixture')",[uid,`billing-${uid}@example.invalid`]);
    await client.query("INSERT INTO oktae.contacts(id,name) VALUES($1,'Synthetic subscription fixture')",[cid]);
    const request={contact_id:cid,request_key:randomUUID(),charge_type:'recurring',store_url:'https://shop.example.invalid/?utm=qa',amount_in_cents:1,currency:'GTQ'};
    assert.throws(()=>paymentInput({...request,store_url:'javascript:alert(1)'}));
    assert.throws(()=>paymentInput({...request,charge_type:'weekly'}));
    const link=await createPayment(request,uid);
    assert.equal(link.amount_in_cents,4900);assert.equal(link.store_url,'https://shop.example.invalid');
    assert.equal(link.subscription_status,'awaiting_authorization');assert.equal(checkouts,1);
    assert.equal((await createPayment(request,uid)).id,link.id);assert.equal(checkouts,1);
    await assert.rejects(()=>createPayment({...request,request_key:randomUUID()},uid),/ya tiene/);assert.equal(checkouts,1);
    await assert.rejects(()=>createPayment({...request,store_url:'https://other.example.invalid'},uid),/otro cobro/);
    // A signed first payment may arrive before subscription.create; a generated link itself is never paid.
    const sid='su_'+randomBytes(8).toString('hex');
    const period='2026-12-20T12:00:00Z';
    subscriptions.set(sid,{id:sid,status:'active',checkout:{id:link.checkout_id},current_period_end:period});
    remoteCheckouts.set(link.checkout_id,{...remoteCheckouts.get(link.checkout_id),status:'paid',payment:{paymentable:{id:sid,type:'Subscription'}}});
    const paid={id:'in_fixture1',legacy_id:'pa_fixture1',event_type:'intent.succeeded',status:'succeeded',amount_in_cents:4900,currency:'USD',checkout:{id:link.checkout_id},subscription:{id:sid},created_at:'2026-11-20T12:00:00Z'};
    intents.set(paid.id,paid);
    const raw=JSON.stringify(paid), eventId='msg_fixture1', now=new Date();
    const signature=new Webhook(process.env.RECURRENTE_WEBHOOK_SECRET!).sign(eventId,now,raw);
    const req=(sig:string)=>new NextRequest('https://www.oktae.tech/api/webhooks/recurrente',{method:'POST',headers:{'svix-id':eventId,'svix-timestamp':String(Math.floor(now.getTime()/1000)),'svix-signature':sig},body:raw});
    assert.equal((await webhook(req('v1,bad'))).status,400);
    assert.equal((await client.query('SELECT count(*)::int AS n FROM oktae.subscription_charges WHERE payment_link_id=$1',[link.id])).rows[0].n,0);
    assert.equal((await webhook(req(signature))).status,200);
    assert.equal((await webhook(req(signature))).status,200);
    await handleSubscriptionEvent({...paid,id:'pa_fixture1',event_type:'payment_intent.succeeded',legacy_id:undefined},'msg_legacy');
    let stored=(await client.query('SELECT * FROM oktae.payment_links WHERE id=$1',[link.id])).rows[0];
    assert.equal(stored.subscription_status,'active');assert.equal(stored.subscription_id,sid);assert.equal(stored.next_billing_at.toISOString(),new Date(period).toISOString());
    assert.equal((await client.query('SELECT count(*)::int AS n FROM oktae.subscription_charges WHERE payment_link_id=$1',[link.id])).rows[0].n,1);
    await assert.rejects(()=>handleSubscriptionEvent({...paid,amount_in_cents:1},'msg_wrong_amount'),/importe/);
    // A renewal has a subscription but can omit the original checkout reference.
    const renewal={...paid,id:'in_fixture2',legacy_id:'pa_fixture2',checkout:undefined,created_at:'2026-12-20T12:00:00Z'};
    intents.set(renewal.id,renewal);
    subscriptions.get(sid).current_period_end='2027-01-20T12:00:00Z';
    await handleSubscriptionEvent(renewal,'msg_renewal');
    assert.equal((await client.query('SELECT count(*)::int AS n FROM oktae.subscription_charges WHERE payment_link_id=$1',[link.id])).rows[0].n,2);
    subscriptions.get(sid).status='past_due';subscriptions.get(sid).next_payment_attempt_at='2027-01-21T12:00:00Z';
    await handleSubscriptionEvent({id:sid,event_type:'subscription.past_due'},'msg_due');
    assert.equal((await client.query('SELECT subscription_status FROM oktae.payment_links WHERE id=$1',[link.id])).rows[0].subscription_status,'past_due');
    subscriptions.get(sid).status='cancelled';
    await handleSubscriptionEvent({id:sid,event_type:'subscription.cancel'},'msg_cancel');
    await handleSubscriptionEvent({id:sid,event_type:'subscription.create'},'msg_delayed_create');
    await syncSubscription(link.id);
    assert.equal((await client.query('SELECT subscription_status FROM oktae.payment_links WHERE id=$1',[link.id])).rows[0].subscription_status,'cancelled');
    const replacement=await createPayment({...request,request_key:randomUUID()},uid);
    assert.notEqual(replacement.id,link.id);
    remoteCheckouts.get(replacement.checkout_id).status='expired'; await syncSubscription(replacement.id);
    assert.equal((await client.query('SELECT subscription_status FROM oktae.payment_links WHERE id=$1',[replacement.id])).rows[0].subscription_status,'expired');
    // A timeout is not a reason to retry checkout creation with a new key.
    ambiguous=true;
    const failing={...request,request_key:randomUUID(),store_url:'https://timeout.example.invalid'};
    await assert.rejects(()=>createPayment(failing,uid)); const attempts=checkouts;
    await assert.rejects(()=>createPayment(failing,uid),/ya fue enviada/);
    await assert.rejects(()=>createPayment({...failing,request_key:randomUUID()},uid),/ya tiene/);
    assert.equal(checkouts,attempts); ambiguous=false;
    const once=await createPayment({contact_id:cid,request_key:randomUUID(),concept:'Instalación',amount_in_cents:39900,currency:'USD'},uid);
    assert.equal(once.charge_type,'one_time');assert.equal(once.subscription_status,null);
    assert.equal(await handleSubscriptionEvent({event_type:'intent.succeeded',checkout:{id:once.checkout_id}},'msg_once'),false);
  }finally{
    globalThis.fetch=oldFetch;process.env=oldEnv;globalDb.oktaePool=beforePool;
    await client.query('ROLLBACK');await client.end();
  }
});
