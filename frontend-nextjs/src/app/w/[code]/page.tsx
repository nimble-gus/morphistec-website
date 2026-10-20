import type {Metadata} from 'next';
import {db} from '@/lib/crm/db';
import {handoffUuid,whatsappLaunchUrls} from '@/lib/crm/sales-protocol';
import OpenWhatsApp from './open-whatsapp';
import './whatsapp-launch.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Continuar en WhatsApp · Oktae',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function WhatsAppLaunch({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 let valid=false,unavailable=false;let source:'messenger'|'instagram'='messenger';
 if(handoffUuid.test(code))try{const h=await db().query('SELECT source_channel FROM oktae.messenger_handoffs WHERE code=$1 AND expires_at>now()',[code]);valid=Boolean(h.rowCount);if(h.rows[0]?.source_channel==='instagram')source='instagram';}catch{unavailable=true;}
 const urls=whatsappLaunchUrls(valid?code:null,source);
 return <main className="wa-launch"><div className="wa-launch-content">
  <a className="wa-launch-brand" href="https://www.oktae.tech" aria-label="Oktae, inicio">oktae<span>.</span></a>
  <h1>Continúa en WhatsApp</h1>
  <p className="wa-launch-intro">{valid?'Abre el chat de Oktae y envía el mensaje preparado para retomar tu consulta.':'Puedes escribir directamente al WhatsApp de Oktae.'}</p>
  {!valid&&<p className="wa-launch-notice" role="status">{unavailable?'No pudimos recuperar tu referencia. Puedes abrir el chat o volver a intentar este enlace más tarde.':'Esta referencia ya no está disponible. Cuéntanos qué estabas revisando al escribirnos.'}</p>}
  <OpenWhatsApp {...urls} autoOpen={valid}/>
  <p className="wa-launch-footer">El mensaje queda preparado. Tú decides cuándo enviarlo.</p>
 </div></main>;
}
