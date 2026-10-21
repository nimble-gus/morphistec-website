import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handoffCode,transferOutput,salesDetails,supportedDemoTime,whatsappLaunchUrls} from '../src/lib/crm/sales-protocol';
const code='73b497c2-41dc-4f01-a238-121345667890';
test('handoff link carries only a random reference, never customer context or a predictable PSID',()=>{
 const link=transferOutput('Continúa aquí: https://wa.me/50231174640?text=Hola',code);
 const url=new URL(link.slice(link.indexOf('https:')));
 assert.equal(url.origin,'https://www.oktae.tech');
 assert.equal(url.pathname,'/w/'+code);
 const launch=whatsappLaunchUrls(code);
 const native=new URL(launch.nativeUrl);
 assert.equal(native.protocol,'whatsapp:');
 assert.equal(native.searchParams.get('phone'),'50231174640');
 assert.equal(handoffCode(native.searchParams.get('text')!),code);
 assert.equal(new URL(launch.webUrl).searchParams.get('text'),launch.message);
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

test('launcher never accepts another recipient or embeds an invalid reference',()=>{
 assert.throws(()=>transferOutput('https://wa.me/50231174640','bad'));
 assert.equal(whatsappLaunchUrls('bad').message,'Hola, vengo de Messenger.');
 assert.equal(new URL(whatsappLaunchUrls(null).nativeUrl).searchParams.get('phone'),'50231174640');
});

import {contactCaptureOutput} from '../src/lib/crm/sales-protocol';
test('social handoff asks only missing contact fields before exposing a link',()=>{
 const link='Continúa aquí: https://wa.me/50231174640?text=Hola';
 assert.match(contactCaptureOutput(link,{}),/nombre/);
 assert.match(contactCaptureOutput(link,{name:'Ana'}),/teléfono/);
 assert.match(contactCaptureOutput(link,{name:'Ana',phone:'50255511111'}),/correo/);
 assert.match(contactCaptureOutput(link,{name:'Ana',phone:'50255511111',email:'inválido'}),/correo/);
 assert.equal(contactCaptureOutput(link,{name:'Ana',phone:'50255511111',email:'ana@example.com'}),link);
 assert.equal(contactCaptureOutput('La instalación es US$399.',{}),'La instalación es US$399.');
});

import {normalizeContactPhone} from '../src/lib/crm/contact-phone';
test('local phones default to 502 while explicit foreign numbers keep their country',()=>{
 assert.equal(normalizeContactPhone('54164264'),'50254164264');
 assert.equal(normalizeContactPhone('5416 4264'),'50254164264');
 assert.equal(normalizeContactPhone('50254164264'),'50254164264');
 assert.equal(normalizeContactPhone('+502 5416-4264'),'50254164264');
 assert.equal(normalizeContactPhone('+52 5512345678'),'525512345678');
 assert.equal(normalizeContactPhone('00525512345678'),'525512345678');
 assert.equal(normalizeContactPhone('54164264','foreign'),'54164264');
 assert.equal(normalizeContactPhone(''),'');
});
