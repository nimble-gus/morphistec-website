import "server-only";
import { db } from "./db";
import { HttpError } from "./errors";
export function historyPage(value: string | null) {
  if (value === null) return 1;
  if (!/^[1-9]\d{0,5}$/.test(value)) throw new HttpError(400,"Página de historial inválida.");
  return Number(value);
}
export async function contactHistory(contactId: string, requestedPage: number) {
  const {rows} = await db().query(`WITH counts AS (
    SELECT ((SELECT count(*) FROM oktae.notes WHERE contact_id=$1) +
      (SELECT count(*) FROM oktae.conversation_messages WHERE contact_id=$1 AND delivery<>'prepared'))::int AS total
  ), pagination AS (
    SELECT total,GREATEST(1,CEIL(total/10.0)::int) AS total_pages,
      LEAST($2,GREATEST(1,CEIL(total/10.0)::int)) AS page FROM counts
  ), history AS (
    SELECT id::text,body,created_at,'note' AS kind FROM oktae.notes WHERE contact_id=$1
    UNION ALL SELECT id,(CASE channel WHEN 'whatsapp' THEN 'WhatsApp' WHEN 'instagram' THEN 'Instagram' ELSE 'Messenger' END)||' · '||
      (CASE direction WHEN 'customer' THEN 'Cliente' WHEN 'assistant' THEN 'Asistente' ELSE 'Gustavo' END)||': '||body,created_at,'message'
      FROM oktae.conversation_messages WHERE contact_id=$1 AND delivery<>'prepared'
  ) SELECT total,total_pages,page,10 AS page_size,
    COALESCE((SELECT jsonb_agg(n ORDER BY created_at DESC,id DESC) FROM (
      SELECT id,body,created_at FROM history ORDER BY created_at DESC,id DESC,kind DESC
      LIMIT 10 OFFSET ((SELECT page FROM pagination)-1)*10
    ) n),'[]'::jsonb) AS items FROM pagination`,[contactId,requestedPage]);
  return rows[0];
}
