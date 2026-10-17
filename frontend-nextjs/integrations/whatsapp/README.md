# WhatsApp privado de Oktae

App Meta `1028300093286703`, configuración Embedded Signup `1786565612453704`, único número admitido `+502 3117 4640`. Pantalla privada: `/admin/whatsapp`.

## Estado actual

Webhook verificado en el objeto **WhatsApp Business Account**, con `messages`, `smb_message_echoes`, `history` y `smb_app_state_sync`. Se recibió una muestra firmada real de Meta y se guardó como `is_test=true`, sin crear lead ni responder a un teléfono.

El código del puente y el borrador de n8n están preparados. El número todavía no está vinculado, el alta de coexistencia y las respuestas siguen bloqueadas por sus respectivos flags. Antes del alta real deben quedar listas la credencial privada de n8n, la comprobación de acceso y la sincronización inicial de coexistencia exigida por Meta. No anunciar el bot como activo por el simple hecho de que el webhook funcione.

## Variables de servidor

- `META_APP_SECRET`: App Secret de ChatOktae. Se valida `X-Hub-Signature-256` sobre el cuerpo original.
- `WHATSAPP_ENCRYPTION_KEY`: 32 bytes aleatorios hexadecimales. AES-256-GCM cifra el token con la WABA como contexto autenticado; no rotar sin recifrar conexiones.
- `WHATSAPP_VERIFY_TOKEN`: valor aleatorio compartido únicamente con el webhook de Meta.
- `WHATSAPP_N8N_WEBHOOK_URL`: `https://n8n-production-2af53.up.railway.app/webhook/oktae-whatsapp-ai`. El servidor rechaza otros destinos, redirecciones y parámetros adicionales.
- `WHATSAPP_N8N_TOKEN`: clave independiente de la sincronización Messenger. En n8n configurar una credencial **Header Auth** con Name `X-Oktae-WhatsApp-Key` y Value igual a esta clave, sin prefijo Bearer. Usarla en `Entrada privada CRM` y `Procesar cola del CRM`.
- `WHATSAPP_ONBOARDING_ENABLED=false`: mantener bloqueado el alta real hasta completar los preparativos de coexistencia; no iniciar el plazo de sincronización de Meta prematuramente.
- `WHATSAPP_BOT_ENABLED=false`: activar únicamente después de vincular el número, verificar el agente y preparar la prueba con un mensaje del propietario.
- `APP_URL=https://www.oktae.tech`.

Las claves se guardan en `.env` y Vercel; no en Git, el navegador cliente ni el chat. El propietario realiza la entrada y el guardado de nuevas credenciales en Meta/n8n. El token de Meta permanece cifrado en el CRM y nunca se entrega al agente de IA.

## Flujo

1. Meta envía un evento firmado al callback `https://www.oktae.tech/api/webhooks/whatsapp`.
2. El receptor valida firma/tamaño, guarda el evento con deduplicación y confirma recepción. Si llega un eco humano del teléfono vinculado, pausa esa conversación inmediatamente por seis horas.
3. Con el bot habilitado, una tarea posterior a la respuesta HTTP transforma textos entrantes recientes en trabajos únicos por WAMID. Historial, contactos, estados y pruebas nunca llegan a la IA ni califican leads.
4. El procesador reclama trabajos con bloqueos y leases por conversación. Llama al agente privado de n8n con una sesión `wa:<waba>:<cliente>`, separada de Messenger/Instagram. El agente devuelve JSON, no envía por Meta ni obtiene su token.
5. El servidor valida la respuesta, revalida pausa humana y ventana de 24 horas, y envía por la conexión de Meta. Un intento de envío que termina con resultado incierto **no se reenvía automáticamente**. Tras dos minutos puede continuar con mensajes nuevos, manteniendo el anterior para revisión.
6. Solo crea un contacto cuando hay encaje de negocio e intención comercial explícita, con interés no vacío. Un saludo, rubro, teléfono disponible o evento de prueba no crean un lead. Los campos manuales de contactos existentes se conservan.
7. Una solicitud de atención humana pausa la IA por 24 horas. La programación de n8n solicita cada minuto la recuperación de trabajos pendientes mediante `POST /api/integrations/whatsapp/process` con la misma credencial privada. Este endpoint confirma aceptación y procesa después; no espera una llamada recursiva del agente.

Primera versión: texto y números de remitente disponibles. Los adjuntos y mensajes sin identificación telefónica válida se conservan en el evento original para atención humana; no se responde a contenido que el sistema no puede interpretar. Los payloads históricos grandes están sujetos al límite del hosting de Vercel: revisar consentimiento y estrategia de sincronización antes del alta.

## Alta de coexistencia pendiente

- Meta Login for Business: permitir el origen `https://www.oktae.tech` y redirect `https://www.oktae.tech/admin/whatsapp`, conservando HTTPS y modo estricto.
- Configuración Embedded Signup v4: producto Cloud API, usuario de sistema 60 días, cuentas WhatsApp y permisos `whatsapp_business_management` / `whatsapp_business_messaging`. En acceso estándar solo pueden probar personas con rol en la app; clientes requieren acceso avanzado.
- Publicar el nuevo flujo y comprobar su rama `healthcheck` privada antes de habilitar el botón de alta. Comprobar modelo y memoria con una prueba de IA sin envío externo.
- Preparar el cumplimiento del plazo inicial de sincronización de contactos/historial de Meta y el consentimiento correspondiente. No importar historial sin autorización; nunca enviarlo a la IA como mensajes nuevos.
- El propietario completa el flujo de **conectar WhatsApp Business existente**, revisa los cambios de funciones/permisos y verifica su teléfono/QR.
- El backend comprueba `is_on_biz_app=true`, `platform_type=CLOUD_API` y el número exacto, y suscribe la WABA. **Nunca llama `/register` ni `/deregister`**, ni cambia el PIN del teléfono.
- El formato del evento del SDK usa `sessionInfoVersion: "3"`; no equivale a Embedded Signup v3. La versión v4 se selecciona mediante los productos de la configuración.
- Probar una conversación del propietario y su respuesta humana antes de declarar completada la conexión.

## Validación

`npm run test:whatsapp` cubre firma, cifrado, origen, número, fechas, destino privado del agente y calificación. `npm run test:whatsapp:integration` usa Railway dentro de transacciones revertidas y simula todas las llamadas a IA/Meta; valida replay, persistencia cifrada, deduplicación, pausa humana, separación de pruebas/historial, creación condicional de contactos y ausencia de reenvíos ante timeout ambiguo.

Migraciones: `npm run db:migrate`. El esquema permanece en `oktae`.

Fuentes oficiales:
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/version-4
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider

## Sincronización inicial

El alta requiere consentimiento explícito del administrador para recibir contactos y el historial que comparta en Meta. Después de suscribir la cuenta, se encolan las solicitudes `smb_app_state_sync` y `history`. Se inicia inmediatamente después de guardar el alta y el disparador privado de n8n recupera solicitudes pendientes cada minuto. Los identificadores de solicitud se conservan. Una respuesta ambigua no se reintenta: deja el bot pausado y requiere revisión. La aceptación de las solicitudes no confirma que el usuario haya compartido historial. El historial y los contactos recibidos permanecen como eventos privados; no se convierten en leads ni entran en la memoria de IA.

La tabla conserva una solicitud por tipo y número. Una nueva alta después de una desconexión requiere revisar manualmente este registro para establecer un nuevo ciclo; no borrar ni reiniciar una sincronización incierta automáticamente. Suscribir también `account_update`: `PARTNER_REMOVED` pausa el canal inmediatamente.
