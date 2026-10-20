# Instagram, WhatsApp y CRM de Oktae

La cuenta Instagram de Oktae verificada en Meta es `17841473350351714` (`oktae.tech`). La integración privada `/api/integrations/instagram/sales` reutiliza `WHATSAPP_N8N_TOKEN` con el encabezado `X-Oktae-WhatsApp-Key`. No requiere variables nuevas.

La migración aditiva `010_instagram_sales.sql` incorpora el canal Instagram en el historial, un registro por cuenta/remitente y origen en las referencias de transferencia. Los mensajes se conservan sin convertir cada saludo en un prospecto. El contacto se crea cuando existe una necesidad y una progresión comercial calificada o una transferencia voluntaria con necesidad conocida. No se exige nombre ni teléfono. Los mensajes del asistente se muestran como enviados solo después del recibo de Meta.

El contexto puede pasar de Instagram a WhatsApp mediante una referencia aleatoria de 7 días, de un solo remitente. No se fusionan contactos distintos automáticamente. El número de WhatsApp de Oktae atiende también consultas directas sin referencia y conserva su historial antes de que exista una oportunidad calificada.

El flujo `Oktae Chat` debe inicializar correctamente el canal y filtrar las actualizaciones por cuenta/canal. La memoria de Instagram usa `ig:cuenta:remitente`; Messenger conserva su clave anterior para mantener su historial. Los nodos nuevos se documentan sin credenciales en `integrations/n8n/instagram-sales.nodes.json`.

El agente WhatsApp de Oktae utiliza `integrations/whatsapp/system-instructions.txt`: web, ecommerce, aplicaciones, plataformas empresariales, IA, automatización e integraciones. Demos tentativas de 15 minutos requieren confirmación manual de Gustavo; pagos compartidos manualmente. Las pausas por respuesta humana y por derivación explícita siguen vigentes. Los mensajes omitidos durante esas pausas no se reenvían automáticamente.

Pruebas con rollback y red simulada:
`NODE_OPTIONS='--conditions=react-server' npx tsx --test tests/instagram-sales-integration.test.ts tests/sales.test.ts tests/whatsapp-bot-integration.test.ts`

La renovación de un token inválido de Instagram debe completarla el administrador en Meta y guardarla en el nodo de envío de n8n. No exportar ni versionar tokens. Las conversaciones históricas anteriores a esta integración no se importan por este endpoint automáticamente.

El flujo filtra `is_echo`, mensajes cuyo remitente es la propia cuenta, eventos sin texto y mensajes eliminados antes de llamar a la IA o registrar conversaciones. El discurso de Messenger/Instagram está en `integrations/n8n/social-system-instructions.txt`; el de WhatsApp, en `integrations/whatsapp/system-instructions.txt`. Ambos explican beneficios, alcance y condiciones comerciales sin divulgar plantillas o procesos internos.
