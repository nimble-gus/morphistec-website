import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {linkMessengerContext,saveSalesReply,salesContext} from '../src/lib/crm/whatsapp-sales';
import {parseAgentAnswer} from '../src/lib/crm/whatsapp-bot-protocol';
try{process.loadEnvFile('.env');}catch{}
test('transfer binds to one sender, keeps the CRM contact, archives replies and records only supported pending demos',async()=>{
 const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();
 const waba='sales-'+randomUUID(),sender='50255556666',other='50255557777',user=randomUUID(),contact=randomUUID(),code=randomUUID(),expired=randomUUID();
 (globalThis as unknown as {oktaePool:unknown}).oktaePool={query:c.query.bind(c)};
 try{
 await c.query('BEGIN');
 await c.query("INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'test-only')",[user,user+'@example.invalid']);
 await c.query("INSERT INTO oktae.contacts(id,name,source) VALUES($1,'Prueba transferencia','messenger')",[contact]);
 await c.query("INSERT INTO oktae.messenger_leads(page_id,psid,contact_id,interest,observed_at) VALUES('1248689791655149',$1,$2,'Tienda para una óptica',now())",[randomUUID(),contact]);
 await c.query('INSERT INTO oktae.messenger_handoffs(code,contact_id,source_message_id) VALUES($1,$2,$3)',[code,contact,randomUUID()]);
 await c.query("INSERT INTO oktae.messenger_handoffs(code,contact_id,source_message_id,expires_at) VALUES($1,$2,$3,now()-interval '1 minute')",[expired,contact,randomUUID()]);
 for(const s of [sender,other])await c.query('INSERT INTO oktae.whatsapp_conversations(waba_id,sender_id) VALUES($1,$2)',[waba,s]);
 await linkMessengerContext(c,waba,other,'Referencia OKTAE-'+expired);
 assert.equal((await c.query('SELECT contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1 AND sender_id=$2',[waba,other])).rows[0].contact_id,null);
 await linkMessengerContext(c,waba,sender,'Referencia OKTAE-'+code);
 await linkMessengerContext(c,waba,other,'Referencia OKTAE-'+code);
 const rows=(await c.query('SELECT sender_id,contact_id FROM oktae.whatsapp_conversations WHERE waba_id=$1',[waba])).rows;
 assert.equal(rows.find(r=>r.sender_id===sender).contact_id,contact);
 assert.equal(rows.find(r=>r.sender_id===other).contact_id,null);
 const ctx=JSON.parse(await salesContext(waba,sender));assert.equal(ctx.contact.interest,'Tienda para una óptica');
 await c.query("INSERT INTO oktae.conversation_messages(id,waba_id,sender_id,channel,direction,body) VALUES($1,$2,$3,'whatsapp','customer','Quiero la demo mañana a las 10')",[randomUUID(),waba,sender]);
 const job={message_id:randomUUID(),waba_id:waba,sender_id:sender};
 const answer=parseAgentAnswer({reply:'La demo dura 15 minutos; Gustavo debe confirmar el horario.',summary:'Solicita demo',demo:{requested:true,preferred_time:'mañana a las 10'}});
 await saveSalesReply(c,job,answer,user);
 await saveSalesReply(c,job,answer,user);
 const demos=await c.query('SELECT status,duration_minutes FROM oktae.demo_requests WHERE contact_id=$1',[contact]);
 assert.equal(demos.rowCount,1);assert.equal(demos.rows[0].status,'pending_confirmation');assert.equal(demos.rows[0].duration_minutes,15);
 await saveSalesReply(c,{...job,message_id:randomUUID()},parseAgentAnswer({reply:'Otra respuesta',demo:{requested:true,preferred_time:'lunes a las 12'}}),user);
 assert.equal((await c.query('SELECT count(*)::int AS n FROM oktae.demo_requests WHERE contact_id=$1',[contact])).rows[0].n,1);
 assert.equal((await c.query("SELECT count(*)::int AS n FROM oktae.conversation_messages WHERE waba_id=$1 AND direction='assistant'",[waba])).rows[0].n,2);
 }finally{await c.query('ROLLBACK');await c.end();delete(globalThis as unknown as {oktaePool?:unknown}).oktaePool;}
});
