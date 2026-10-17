# WhatsApp de Oktae: conexión por coexistencia

Pantalla privada: `/admin/whatsapp`. Meta app: `1028300093286703`. Configuración: `1786565612453704`. Único número admitido: `+502 3117 4640`.

## Estado y límites

Esta fase prepara la autorización, valida coexistencia y guarda la credencial cifrada, y recibe eventos firmados de Meta. **No activa respuestas del bot, no crea prospectos calificados, no importa historial/contactos y no completa automáticamente la sincronización de coexistencia.** La pantalla informa que el agente n8n sigue pendiente. Antes del alta real, planificar la sincronización exigida por Meta dentro de 24 horas; no iniciar el alta si no se puede completar ese paso. Los payloads recibidos quedan en la cola privada para su procesamiento posterior. Los datos históricos no deben enviarse al agente como mensajes nuevos.

No se llama a `/register` ni `/deregister`: el número de coexistencia ya está registrado. No se configura un PIN nuevo. Las fechas límite del token se muestran en el portal; renovar antes de expirar (configuración de 60 días).

## Variables de servidor

- `META_APP_SECRET`: App Secret de ChatOktae (no el token de Messenger/Instagram).
- `WHATSAPP_ENCRYPTION_KEY`: 32 bytes aleatorios en hexadecimal, 64 caracteres. Cifra credenciales AES-256-GCM; conservar la clave mientras existan conexiones. No rotarla sin volver a cifrar los registros.
- `WHATSAPP_VERIFY_TOKEN`: secreto aleatorio de al menos 32 caracteres, compartido únicamente con la configuración del webhook en Meta.
- `WHATSAPP_ONBOARDING_ENABLED`: mantener `false` hasta preparar y validar la sincronización de coexistencia y n8n; este bloqueo evita iniciar el plazo de 24 horas antes de estar listos.
- `APP_URL`: `https://www.oktae.tech`, ya usado por el CRM.

Crear cada valor aleatorio por separado con `openssl rand -hex 32`, y guardarlos directamente en `.env` / Vercel. No compartirlos por chat ni incluirlos en Git. El usuario completa la entrada y guardado de credenciales.

## Despliegue y Meta

1. Ejecutar `npm run db:migrate` (agrega tablas `oktae.whatsapp_*`).
2. Guardar variables del servidor, desplegar y abrir `/admin/whatsapp` con sesión de administrador.
3. Meta App > Facebook Login for Business > Settings: permitir `https://www.oktae.tech` y el redirect `https://www.oktae.tech/admin/whatsapp`. Mantener HTTPS y modo estricto.
4. Configuración de WhatsApp: seleccionar producto **WhatsApp Cloud API**, Embedded Signup v4, usuario de sistema con 60 días, solo cuentas WhatsApp y permisos `whatsapp_business_management`, `whatsapp_business_messaging`. En acceso estándar solo pueden probar personas con rol en la app; clientes requieren revisión/acceso avanzado.
5. Callback: `https://www.oktae.tech/api/webhooks/whatsapp`. Token de verificación: el valor exacto de `WHATSAPP_VERIFY_TOKEN`. Suscribir `messages`, `smb_message_echoes`, `history`, `smb_app_state_sync`. Las solicitudes entrantes requieren `X-Hub-Signature-256` válido con el App Secret.
6. Resolver primero la sincronización/consentimiento de coexistencia y el procesamiento n8n; después, usar el botón privado y elegir **conectar WhatsApp Business existente**. El usuario revisa las condiciones, verifica el número/QR y confirma cualquier nuevo permiso en Meta. No eliminar la cuenta móvil ni utilizar migración convencional.
7. Confirmar el número +502 3117 4640, `is_on_biz_app=true`, `platform_type=CLOUD_API`, suscripción a la WABA y recepción de mensajes. El backend verifica estas condiciones, consume una autorización de un solo uso y no devuelve el token al navegador.
8. Conectar n8n a la cola antes de anunciar el bot como activo: deduplicar por WAMID, distinguir mensajes entrantes, estados, historial y eco de atención humana; pausar la IA cuando una persona atiende; evitar enviar un enlace al mismo número; aplicar calificación comercial independiente del teléfono disponible.

La recepción de un webhook no significa que el bot haya respondido, ni que el contacto esté calificado. No probar envíos a terceros sin autorización.

## Fuentes oficiales consultadas

- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/version-4
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider

La sesión del SDK usa `sessionInfoVersion: "3"`; este es el formato del evento, no Embedded Signup v3. La versión v4 del flujo se selecciona mediante los productos en la configuración de Meta. El modo Hosted ES no permite personalizar el flujo; no se usa para este requisito de coexistencia.
