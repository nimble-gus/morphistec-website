import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg,{type PoolClient} from 'pg';
import {saveInstagramSales,instagramInput} from '../src/lib/crm/instagram-sales';
import {linkMessengerContext,salesContext} from '../src/lib/crm/whatsapp-sales';
import {handoffCode,whatsappLaunchUrls} from '../src/lib/crm/sales-protocol';
try{process.loadEnvFile('.env');}catch{}
test('Instagram archives queries without junk leads, qualifies intent, deduplicates and passes scoped context into WhatsApp',async()=>{
 const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();let sp=0;
 const query=c.query.bind(c);const nested=()=>{const name='ig_test_'+ ++sp;return {query:(sql:string,v?:unknown[])=>c.query(sql==='BEGIN'?'SAVEPOINT '+name:sql==='COMMIT'?'RELEASE SAVEPOINT '+name:sql==='ROLLBACK'?'ROLLBACK TO SAVEPOINT '+name:sql,v),release:()=>{}} as unknown as PoolClient;};
 (globalThis as unknown as {oktaePool:unknown}).oktaePool={query,connect:async()=>nested()};
 const account='17841473350351714',sender='9988'+Date.now(),mid='ig-qa-'+randomUUID(),waba='988887776665554',waSender='50255512345';
 const base={account_id:account,psid:sender,source_message_id:mid,text:'Hola',output:'Hola, ¿qué necesitas?',lead:{name:'',interest:'',stage:'new'}};
 try{await c.query('BEGIN');assert.throws(()=>instagramInput({...base,account_id:'111111111111'}));
 await saveInstagramSales(nested(),base);
 let lead=(await c.query('SELECT * FROM oktae.instagram_leads WHERE account_id=$1 AND sender_id=$2',[account,sender])).rows[0];assert.equal(lead.contact_id,null,'a greeting must not create a contact');
 const request={...base,source_message_id:mid+'-2',text:'Quiero cotizar una plataforma empresarial',output:'Podemos continuar por WhatsApp: https://wa.me/50231174640?text=Hola',lead:{name:'',interest:'Plataforma empresarial para inventario',stage:'qualified'}};
 const result=await saveInstagramSales(nested(),request);const replay=await saveInstagramSales(nested(),request);assert.equal(replay.output,result.output);
 lead=(await c.query('SELECT * FROM oktae.instagram_leads WHERE account_id=$1 AND sender_id=$2',[account,sender])).rows[0];assert.ok(lead.contact_id);
 const contact=(await c.query('SELECT source FROM oktae.contacts WHERE id=$1',[lead.contact_id])).rows[0];assert.equal(contact.source,'instagram');
 assert.equal((await c.query("SELECT count(*)::int AS n FROM oktae.conversation_messages WHERE contact_id=$1 AND channel='instagram'",[lead.contact_id])).rows[0].n,4);
 assert.ok(result.output);const code=result.output.match(/\/w\/([a-f0-9-]{36})/)?.[1];assert.ok(code);assert.match(whatsappLaunchUrls(code,'instagram').message,/Instagram/);
 const out=(await c.query("SELECT delivery FROM oktae.conversation_messages WHERE contact_id=$1 AND direction='assistant' ORDER BY created_at DESC,id DESC",[lead.contact_id])).rows;assert.ok(out.every(r=>r.delivery==='prepared'));
 await saveInstagramSales(nested(),{...request,action:'ack',message_id:'meta-receipt-qa'});
 await c.query('INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id,last_customer_at) VALUES($1,$2,now())',[waba,waSender]);
 await linkMessengerContext(c as unknown as PoolClient,waba,waSender,'Hola, vengo de Instagram. OKTAE-'+code);
 const context=JSON.parse(await salesContext(waba,waSender));assert.equal(context.contact.source,'instagram');assert.match(context.contact.interest,/Plataforma empresarial/);assert.ok(context.recent_messages.some((m:{channel:string;body:string})=>m.channel==='instagram'&&m.body.includes('cotizar')));
 assert.equal(handoffCode('OKTAE-'+code),code);
 const direct='50255512346';await c.query('INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id,last_customer_at) VALUES($1,$2,now())',[waba,direct]);
 await c.query("INSERT INTO oktae.conversation_messages(id,waba_id,sender_id,channel,direction,body) VALUES($1,$2,$3,'whatsapp','customer','Necesito una app móvil para mi negocio')",[mid+'-direct',waba,direct]);
 const directContext=JSON.parse(await salesContext(waba,direct));assert.equal(directContext.contact,null);assert.equal(directContext.recent_messages.length,1);assert.match(directContext.recent_messages[0].body,/app móvil/);
 }finally{await c.query('ROLLBACK');await c.end();delete(globalThis as unknown as {oktaePool?:unknown}).oktaePool;}
});
