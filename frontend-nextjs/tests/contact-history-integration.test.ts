import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {contactHistory,historyPage} from '../src/lib/crm/contact-history';
try{process.loadEnvFile('.env');}catch{}
test('contact history merges channels and notes, serves ten stable rows per page and excludes prepared messages',async()=>{
 const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();await client.query('BEGIN');
 const globalDb=globalThis as unknown as {oktaePool?:unknown};const before=globalDb.oktaePool;globalDb.oktaePool={query:client.query.bind(client)};
 try{
  assert.equal(historyPage(null),1);for(const bad of ['0','-1','1.2','abc','1000000'])assert.throws(()=>historyPage(bad));
  const cid=randomUUID(),other=randomUUID(),uid=randomUUID();
  await client.query("INSERT INTO oktae.users(id,email,password_hash) VALUES($1,$2,'no-login-fixture')",[uid,uid+'@example.invalid']);
  await client.query("INSERT INTO oktae.contacts(id,name) VALUES($1,'History fixture'),($2,'Other fixture')",[cid,other]);
  await client.query("INSERT INTO oktae.notes(contact_id,body,created_by,created_at) SELECT $1,'Nota '||n,$2,'2026-10-20T12:00:00Z'::timestamptz FROM generate_series(1,9) n",[cid,uid]);
  for(let i=0;i<12;i++) await client.query("INSERT INTO oktae.conversation_messages(id,contact_id,channel,direction,body,delivery,created_at) VALUES($1,$2,$3,'customer',$4,'received','2026-10-20T12:00:00Z')",[randomUUID(),cid,['messenger','instagram','whatsapp'][i%3],'Mensaje '+i]);
  await client.query("INSERT INTO oktae.conversation_messages(id,contact_id,channel,direction,body,delivery) VALUES($1,$2,'whatsapp','assistant','No enviado','prepared'),($3,$4,'whatsapp','customer','Otro contacto','received')",[randomUUID(),cid,randomUUID(),other]);
  const pages=[];for(const n of [1,2,3])pages.push(await contactHistory(cid,n));
  assert.deepEqual(pages.map(p=>p.items.length),[10,10,1]);assert.equal(pages[0].total,21);assert.equal(pages[0].total_pages,3);
  const items=pages.flatMap(p=>p.items);assert.equal(new Set(items.map(n=>n.id)).size,21);
  assert.ok(items.some(n=>n.body.startsWith('Instagram · Cliente:')));assert.ok(items.every(n=>!n.body.includes('No enviado')&&!n.body.includes('Otro contacto')));
  assert.deepEqual((await contactHistory(cid,1)).items.map(n=>n.id),pages[0].items.map(n=>n.id));
  assert.equal((await contactHistory(cid,999)).page,3);
  const empty=await contactHistory(randomUUID(),1);assert.equal(empty.total,0);assert.equal(empty.page,1);assert.deepEqual(empty.items,[]);
 }finally{globalDb.oktaePool=before;await client.query('ROLLBACK');await client.end();}
});
