-- Solo lectura. El flujo del bot conserva su base y su funcionamiento.
-- Cada fila es un lote para un nodo HTTP Request de n8n.
WITH source_leads AS (
 SELECT to_jsonb(l) AS d, row_number() OVER(ORDER BY l.psid) AS rn
 FROM leads l
 WHERE to_jsonb(l)->>'page_id' = '1248689791655149'
   AND lower(COALESCE(NULLIF(to_jsonb(l)->>'channel',''),'messenger')) = 'messenger'
), prepared AS (
 SELECT (rn-1)/25 AS batch_id, d->>'psid' AS psid,
 jsonb_build_object('psid',d->>'psid','page_id',d->>'page_id','channel','messenger',
 'name',COALESCE(d->>'name',''),'phone',COALESCE(d->>'phone',''),'email',COALESCE(d->>'email',''),
 'interest',COALESCE(d->>'interest',''),'stage',COALESCE(d->>'stage','new'),
 'last_contact_at',d->>'last_contact_at','created_at',COALESCE(d->>'created_at',d->>'first_contact_at')) AS lead
 FROM source_leads
)
SELECT jsonb_build_object('observed_at',CURRENT_TIMESTAMP,'leads',jsonb_agg(lead ORDER BY psid)) AS crm_payload
FROM prepared GROUP BY batch_id ORDER BY batch_id;
