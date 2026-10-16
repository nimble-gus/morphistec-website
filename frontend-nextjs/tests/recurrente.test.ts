import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recurrente} from '../src/lib/crm/recurrente';
test('Recurrente usa servidor, checkout hospedado y no expone errores del proveedor',async()=>{
 const originalFetch=globalThis.fetch,originalKey=process.env.RECURRENTE_SECRET_KEY;
 process.env.RECURRENTE_SECRET_KEY='sk_test_synthetic_fixture';
 try{
 let calls=0;
 globalThis.fetch=async(input,init)=>{calls++;assert.equal(String(input),'https://app.recurrente.com/api/checkouts');assert.equal(init?.method,'POST');assert.equal((init?.headers as Record<string,string>)['X-SECRET-KEY'],'sk_test_synthetic_fixture');const payload=JSON.parse(String(init?.body));assert.equal(payload.items[0].amount_in_cents,49900);return Response.json({id:'ch_test',checkout_url:'https://app.recurrente.com/checkout-session/ch_test'});};
 const result=await recurrente('/checkouts',{items:[{name:'Anticipo',amount_in_cents:49900,currency:'USD',quantity:1,charge_type:'one_time'}]});assert.equal(result.id,'ch_test');assert.equal(calls,1);
 globalThis.fetch=async()=>new Response('sensitive upstream body',{status:422});
 await assert.rejects(()=>recurrente('/checkouts',{}),e=>e instanceof Error&&!e.message.includes('sensitive'));
 process.env.RECURRENTE_SECRET_KEY='';await assert.rejects(()=>recurrente('/checkouts',{}));
 }finally{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.RECURRENTE_SECRET_KEY;else process.env.RECURRENTE_SECRET_KEY=originalKey;}
});
