# Seguimiento comercial de Messenger a WhatsApp

El agente de WhatsApp resuelve dudas y avanza a la contratación. La demo es opcional, dura 15 minutos y cualquier horario queda pendiente de confirmación manual de Gustavo. No se conecta un calendario ni se generan invitaciones. El envío del link de pago sigue siendo manual después de la demo.

El flujo de Messenger consulta el lead actualizado después de la IA, guarda el turno mediante el endpoint privado `/api/integrations/messenger/sales` y sustituye el enlace genérico por una referencia aleatoria. El enlace corto `/w/[code]` muestra únicamente la marca y el número de Oktae. Intenta abrir la app móvil una vez mediante su esquema nativo y ofrece un botón de apertura y copia manual, sin redirección automática a descargas. El cliente debe enviar el texto prellenado al abrir WhatsApp. La referencia vence a los siete días, solo se vincula a un remitente y conserva el contacto original del CRM. Si el usuario borra la referencia o usa un enlace anterior, el bot pide el contexto que falte; no adivina identidades por el nombre o por un teléfono no verificado.

La misma credencial privada de cabecera que ya conecta n8n con el CRM autentica los nodos comerciales. No se crean nuevas claves. La rama de Instagram conserva su funcionamiento.

Después del recibo de Meta, el flujo confirma el envío de Messenger. Los borradores no aparecen como mensajes enviados. Los mensajes nuevos de Messenger, las respuestas del bot de WhatsApp y los ecos que Meta entregue de respuestas humanas aparecen en **Notas de seguimiento** de la ficha del contacto, junto con los resúmenes y solicitudes de demo. Las conversaciones de WhatsApp sin intención comercial se conservan sin crear automáticamente un prospecto. No se importa retroactivamente el historial anterior de Messenger; los eventos antiguos de WhatsApp siguen en su almacenamiento original.

Las solicitudes quedan en `oktae.demo_requests` con estado `pending_confirmation`; el bot no puede cambiarlas a confirmadas. El fragmento del horario debe existir en un mensaje del cliente. Gustavo confirma personalmente el horario y el enlace de la reunión por WhatsApp y registra su seguimiento en las notas del CRM. Puede usar la etapa Demo para organizar su funnel. El bot no marca una venta ganada ni un pago recibido.

Aplicar `npm run db:migrate` antes de desplegar el backend. Publicar después los cambios de ambos flujos en n8n. No guardar los archivos completos exportados de Messenger en Git: pueden contener secretos del flujo original.

Validación: pruebas de referencia, caducidad, vinculación a un único remitente, persistencia del contexto, reintentos idempotentes, confirmación del recibo de Meta y solicitud de demo de 15 minutos pendiente. Las pruebas de base de datos se revierten y no envían mensajes reales.
