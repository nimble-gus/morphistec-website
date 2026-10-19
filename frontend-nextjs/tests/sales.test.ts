import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handoffCode,transferOutput,salesDetails,supportedDemoTime} from '../src/lib/crm/sales-protocol';
const code='73b497c2-41dc-4f01-a238-121345667890';
test('handoff link carries only a random reference, never customer context or a predictable PSID',()=>{
 const link=transferOutput('Continúa aquí: https://wa.me/50231174640?text=Hola',code);
 const url=new URL(link.slice(link.indexOf('https:')));
 assert.equal(handoffCode(url.searchParams.get('text')!),code);
 assert.equal(handoffCode('OKTAE-12345'),null);
 assert.ok(!url.search.includes('psid'));
});
test('demo time must come from customer text; output cannot mark a confirmed appointment',()=>{
 const data=salesDetails({summary:'Necesita tienda',demo:{requested:true,preferred_time:'mañana a las 10',status:'confirmed',duration:90}});
 assert.ok(supportedDemoTime(data.preferredTime,['Me funciona mañana a las 10']));
 assert.equal(supportedDemoTime('lunes a las 12',['Mañana a las 10']),false);
 assert.equal(supportedDemoTime('', ['hola']),false);
 assert.equal('status' in data,false);
 assert.equal(salesDetails({demo:{requested:'true'}}).demoRequested,false);
});
