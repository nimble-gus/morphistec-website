"use client";
import {useEffect,useState,useRef} from 'react';
import {ArrowUpRight,Copy,Check,MessageCircle} from 'lucide-react';
type Props={autoOpen:boolean;message:string;phone:string;nativeUrl:string;webUrl:string};
export default function OpenWhatsApp({autoOpen,message,phone,nativeUrl,webUrl}:Props){
 const autoAttempt=useRef<string|null>(null);
 const [attempted,setAttempted]=useState(false),[copied,setCopied]=useState(''),[copyError,setCopyError]=useState(false);
 useEffect(()=>{
  if(!autoOpen||autoAttempt.current===nativeUrl||!/Android|iPhone|iPad/i.test(navigator.userAgent))return;
  autoAttempt.current=nativeUrl;
  // One attempt, no timed fallback to an app store or another external page.
  window.location.href=nativeUrl;
 },[autoOpen,nativeUrl]);
 async function copy(value:string,label:string){
  try{await navigator.clipboard.writeText(value);setCopied(label);setCopyError(false);}catch{setCopyError(true);}
 }
 return <section aria-label="Abrir conversación con Oktae">
  <div className="wa-launch-recipient"><MessageCircle size={22} aria-hidden="true"/><div><strong>Oktae</strong><span>{phone}</span></div></div>
  <a className="wa-launch-primary" href={nativeUrl} onClick={()=>setAttempted(true)}>Abrir WhatsApp<ArrowUpRight size={20} aria-hidden="true"/></a>
  <p className="wa-launch-hint" role="status">{attempted?'Si no se abrió el chat, usa las opciones de abajo.':'Si aparece un aviso del teléfono, permite abrir WhatsApp.'}</p>
  <details className="wa-launch-help">
   <summary>¿No se abrió la conversación?</summary>
   <p>Si estás dentro de Facebook o Messenger, abre el menú de tres puntos y elige abrir esta página en Safari o en tu navegador. Después pulsa «Abrir WhatsApp».</p>
   <p>También puedes buscar este número en WhatsApp y pegar el mensaje:</p>
   <div className="wa-launch-copy-row"><span>{phone}</span><button type="button" onClick={()=>copy('50231174640','número')} aria-label="Copiar número de Oktae">{copied==='número'?<Check size={18}/>:<Copy size={18}/>}Copiar número</button></div>
   <label htmlFor="wa-prepared-message">Mensaje para continuar</label>
   <textarea id="wa-prepared-message" value={message} readOnly rows={4}/>
   <button type="button" className="wa-launch-copy-message" onClick={()=>copy(message,'mensaje')}>{copied==='mensaje'?<Check size={18}/>:<Copy size={18}/>}Copiar mensaje</button>
   <p role="status">{copyError?'Mantén pulsado el texto para seleccionarlo y copiarlo.':copied?`Se copió el ${copied}.`:''}</p>
   <a className="wa-launch-web" href={webUrl} rel="noreferrer">Usar WhatsApp Web<ArrowUpRight size={16} aria-hidden="true"/></a>
  </details>
 </section>;
}
