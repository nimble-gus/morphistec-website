import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import pg from 'pg';
import {NextRequest} from 'next/server';
import {POST} from '../src/app/api/integrations/messenger/sales/route';
try{process.loadEnvFile('.env');}catch{}
test('private Messenger bridge creates an idempotent handoff and records an assistant message as sent only after a receipt',async()=>{
 const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();
 const key=randomBytes(32).toString('hex'),psid='99'+String(Date.now()),source=randomUUID();process.env.WHATSAPP_N8N_TOKEN=key;
 let savepoint=0;const stack:string[]=[];
 const query=(sql:string,values?:unknown[])=>{if(sql==='BEGIN'){const name='sales_route_'+(++savepoint);stack.push(name);return c.query('SAVEPOINT '+name);}if(sql==='COMMIT')return c.query('RELEASE SAVEPOINT '+stack.pop());if(sql==='ROLLBACK'){const name=stack.pop();return name?c.query('ROLLBACK TO SAVEPOINT '+name):Promise.resolve({rows:[],rowCount:0});}return c.query(sql,values);};
 (globalThis as unknown as {oktaePool:unknown}).oktaePool={connect:async()=>({query,release:()=>{}})};
 const call=(body:unknown,auth=key)=>POST(new NextRequest('https://www.oktae.tech/api/integrations/messenger/sales',{method:'POST',headers:{'Content-Type':'application/json','X-Oktae-WhatsApp-Key':auth},body:JSON.stringify(body)}));
 try{await c.query('BEGIN');
 assert.equal((await call({},'wrong')).status,401);
 const body={psid,source_message_id:source,text:'Quiero una demo de tienda',output:'Puedes continuar aquí: https://wa.me/50231174640?text=Hola',lead:{name:'Prueba puente',interest:'Ecommerce para óptica',stage:'qualifying'}};
 const first=await call(body);assert.equal(first.status,200);const output=(await first.json()).output;assert.match(output,/https:\/\/www\.oktae\.tech\/w\/[a-f0-9-]+/);
 const retry=await call(body);assert.equal((await retry.json()).output,output);
 assert.equal((await c.query('SELECT count(*)::int AS n FROM oktae.messenger_handoffs WHERE contact_id IN (SELECT contact_id FROM oktae.messenger_leads WHERE psid=$1)',[psid])).rows[0].n,1);
 const before=await c.query("SELECT delivery FROM oktae.conversation_messages WHERE contact_id IN (SELECT contact_id FROM oktae.messenger_leads WHERE psid=$1) AND direction='assistant'",[psid]);assert.equal(before.rows[0].delivery,'prepared');
 const ack=await call({action:'ack',psid,source_message_id:source,message_id:'test-receipt'});assert.equal(ack.status,200);
 const after=await c.query("SELECT delivery FROM oktae.conversation_messages WHERE contact_id IN (SELECT contact_id FROM oktae.messenger_leads WHERE psid=$1) AND direction='assistant'",[psid]);assert.equal(after.rows[0].delivery,'accepted');
 }finally{await c.query('ROLLBACK');await c.end();delete(globalThis as unknown as {oktaePool?:unknown}).oktaePool;}
});
