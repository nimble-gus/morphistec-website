# Clientes de WhatsApp IA

Acceso del equipo: `/admin/whatsapp-clients`. Todas las cuentas administrativas autorizadas de Oktae comparten este apartado. No hay registro ni cuenta de acceso para el cliente.

## Operación

1. Crear negocio y registrar su WhatsApp con código de país, contacto, responsable, plan, mensualidad interna y límite de respuestas.
2. Guardar objetivo, información aprobada, tono, horarios y zona horaria. Guardar cambios pausa un agente activo e invalida su prueba anterior.
3. Generar enlace de conexión (30 minutos, reemplaza cualquier enlace anterior). Compartirlo manualmente solo con el dueño. La autorización ocurre en Meta; no ingresar tokens ni contraseñas del cliente en Oktae.
4. Probar el agente dentro del admin (consume IA, no envía WhatsApp). Activar exige una conexión vigente y una prueba de la versión actual.
5. Revisar conversaciones y oportunidades en la ficha del negocio. No se insertan en `oktae.contacts` ni en el funnel comercial propio de Oktae.

El enlace usa coexistencia con WhatsApp Business. Meta determina la elegibilidad y los permisos para números de terceros. El módulo no elimina cuentas, no registra ni migra números automáticamente y no solicita la importación del historial antiguo. Si Meta no permite el alta, la ficha permanece sin activar y se puede generar otra invitación. Una cuenta WABA se asigna a un solo cliente en esta versión.

## Motor y datos

Migración aditiva `009_whatsapp_clients.sql`, aplicada con `node scripts/migrate.mjs`. Tablas `wa_clients`, `wa_client_connections`, `wa_client_invites`, `wa_client_conversations`, `wa_client_messages`, `wa_client_usage`, `wa_client_audit` en el esquema `oktae`.

n8n: **Oktae - Agentes WhatsApp de clientes**, flujo `rk4Nfa8zHuqmz3pM`; plantilla sin claves en `integrations/whatsapp-clients/n8n-agent.json`. Entrada fija `/webhook/oktae-client-whatsapp-ai`, autenticada con la credencial privada existente. El servidor entrega solo la configuración e historial del cliente identificado por WABA y Phone Number ID. No se utiliza memoria compartida de n8n.

Se reutilizan `META_APP_SECRET`, `WHATSAPP_ENCRYPTION_KEY`, `WHATSAPP_N8N_TOKEN`, el App ID/configuración de Meta existentes y el webhook firmado `/api/webhooks/whatsapp`. No se requieren nuevas variables. `WHATSAPP_BOT_ENABLED` sigue siendo el interruptor global. El cron privado existente también recupera los mensajes de clientes.

Tokens cifrados AES-GCM ligados al ID del cliente y WABA. Enlaces guardados como hash; autorización de un solo uso, vinculada a una cookie HttpOnly. Ninguna API administrativa devuelve secretos. Se verifica app del token, número exacto, coexistencia y conflictos con cuentas previamente conectadas. Todos los cambios administrativos exigen sesión y origen permitido.

## Límites y atención humana

La cuota mensual UTC cuenta respuestas aceptadas por Meta; no confirma entrega al destinatario. Las reservas impiden exceder el límite con solicitudes concurrentes. Un envío ambiguo conserva su reserva, requiere revisión y no se reintenta automáticamente. Los fallos confirmados y mensajes omitidos liberan la reserva. Las pruebas internas tienen un límite separado de 100 por mes. El consumo no calcula facturas de Meta/Anthropic ni hace cobros de Recurrente.

Una respuesta manual en la aplicación pausa esa conversación 6 horas. El equipo puede pausar 24 horas o reactivar para mensajes nuevos desde la ficha. Una derivación humana solicitada al agente pausa 24 horas. Mensajes omitidos no se reproducen al reactivar. Solo se responde a textos recientes dentro de la ventana de servicio de 24 horas; historial, muestras y estados de entrega nunca generan respuestas.

## Validación

`NODE_OPTIONS='--conditions=react-server' npx tsx --test tests/wa-clients-integration.test.ts` usa transacciones con rollback, datos sintéticos y red simulada para aislamiento de contexto, activación, deduplicación, cuotas, pausa, referencias revocadas y envíos ambiguos. No envía mensajes reales.

La prueba de n8n con un negocio sintético no conecta un número ni demuestra por sí sola la autorización de cuentas externas en Meta. La primera conexión real debe realizarla el dueño y después probarse desde otro teléfono.
