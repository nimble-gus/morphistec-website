# CRM privado de Oktae

## Estado

Rutas `/admin` y `/admin/login`; prospectos y clientes, edición de datos, etapas, seguimiento, notas, links de pago únicos GTQ/USD, copia de link y preparación de mensaje de WhatsApp. No envía mensajes por sí solo. No tiene registro público ni datos de demostración permanentes.

## Configuración local

Requiere Node.js 22 o posterior. Desde `frontend-nextjs`:

1. Copiar `.env.example` a `.env` únicamente si todavía no existe. Conservar la `DATABASE_URL` configurada. El esquema es `oktae` y no modifica otras tablas.
2. `npm install` y `npm run db:migrate`.
3. Completar `OKTAE_ADMIN_EMAIL` y `OKTAE_ADMIN_PASSWORD` (mínimo 14 caracteres) en `.env`. Ejecutar `npm run admin:create`. Después borrar el valor de la contraseña del `.env`: solo se almacena su hash scrypt en la base. El comando crea una cuenta con cambio obligatorio de contraseña al primer ingreso y rechaza correos ya existentes; no cambia contraseñas de cuentas existentes. El administrador no puede usar las APIs del CRM hasta completar ese cambio. Al cambiar su contraseña se revocan todas las sesiones anteriores y se emite una sesión nueva.
4. `APP_URL=http://127.0.0.1:3000` y `npm run dev -- --hostname 127.0.0.1`. Abrir `http://127.0.0.1:3000/admin`. Si ya existe otra instancia del sitio, usar `OKTAE_BUILD_DIR=.next-crm npm run build` y `OKTAE_BUILD_DIR=.next-crm npm run start -- --hostname 127.0.0.1 --port 3000` para separar sus archivos de compilación.

No subir `.env`, contraseñas o claves a Git. La cuenta inicial no se crea automáticamente ni tiene una contraseña predeterminada.

## Conectar Recurrente

- Configurar `RECURRENTE_SECRET_KEY` con una clave de cuenta `sk_test_...` para pruebas. No usar claves de organización ni variables NEXT_PUBLIC.
- En Configuración → Desarrolladores y API → Webhooks de Recurrente registrar `https://TU-DOMINIO/api/webhooks/recurrente`; el servidor tiene que ser alcanzable desde Internet.
- Configurar `RECURRENTE_WEBHOOK_SECRET` con el signing secret de ese endpoint y el mismo ambiente.
- Crear un prospecto de prueba, abrirlo y generar un link por un importe válido (mínimo Q5 o US$1). En Sandbox pagar con tarjeta de pruebas según documentación oficial.
- Verificar que el estado pasa de Pendiente a Pagado mediante el webhook. Volver al portal o pulsar Actualizar estados para cargar los datos guardados; ese botón no consulta cada cobro a Recurrente.
- Cambiar a clave LIVE y webhook LIVE solo después de completar la prueba.

El portal usa `POST /api/checkouts`, artículos inline y pagos únicos. No crea suscripciones automáticamente, no procesa tarjetas y no marca pagos por una URL de éxito. Verifica firma Svix y confirma el estado del checkout por API, importe y moneda del evento. Deduplica por svix-id. Si falla una generación después de enviar la solicitud, se marca Revisar en Recurrente: comprobar allí antes de crear otro link. No hay garantía de idempotencia del proveedor; la protección de solicitud local evita repetir la misma petición y conserva un caso ambiguo para revisión.

El webhook atiende `intent.succeeded` y su evento legacy equivalente cuando contiene el formato compatible; otros eventos se ignoran. No sincroniza reembolsos, pagos parciales ni suscripciones en esta primera versión.

## Privacidad y despliegue

- No hay enlace al administrador en la web pública. Las páginas de datos exigen sesión en servidor y todas las APIs privadas verifican sesión.
- Sesiones opacas con token hash en PostgreSQL; cookies HttpOnly, SameSite Strict, Secure en producción y vencimiento de 8 horas.
- Validación de origen en escrituras (producción acepta los dominios exactos https://oktae.tech y https://www.oktae.tech; APP_URL permite declarar un origen HTTPS adicional de despliegue); límite de 5 intentos de login por correo en una ventana de 15 minutos, persistido en PostgreSQL.
- Sin indexación ni caché para administración. Es protección por autenticación: `/admin/login` puede ser alcanzable públicamente. Si se necesita que ni siquiera el formulario sea público, añadir VPN o control de acceso del hosting.
- En producción usar HTTPS, `APP_URL` con el origen exacto y una credencial PostgreSQL restringida al esquema `oktae` (la URL actual usa el usuario propietario de la base). No se crean roles ni se cambian permisos de la base existente automáticamente.
- Desplegar tras ejecutar migraciones. Configurar las variables en Railway o el hosting elegido y construir con `npm run build`; iniciar con `npm start`.

## Alcance pendiente

Conexión de la cuenta Recurrente y prueba real de Sandbox requieren claves del usuario. La sincronización de Messenger está implementada y requiere configurar la clave en Vercel y la credencial Header Auth del nuevo flujo n8n. Roles diferenciados, recuperación de contraseña por correo y facturación FEL quedan pendientes. Todas las cuentas autorizadas tienen acceso al mismo CRM.

## Verificación

`npm run type-check`, `npm run test:crm`, lint sobre los archivos nuevos y `npm run build`.
`npm run test:crm:integration` con el servidor local encendido crea y elimina una cuenta y prospecto temporales en la base configurada. Requiere autorización para esa cuenta; ejecutar solo con esa aprobación. No genera cobros externos.

## Messenger → CRM

- Receptor: `POST https://www.oktae.tech/api/integrations/messenger`. Solo acepta Bearer `CRM_MESSENGER_SYNC_TOKEN` (mínimo 32 caracteres), sin acceso a otras funciones del CRM. Configurar el mismo valor en Vercel Production y en la credencial Header Auth de n8n. No subirlo a Git.
- Flujo independiente en `integrations/n8n/messenger-crm.workflow.json`: cada minuto lee los leads de la base actual del bot, en lotes de 25, y los envía al CRM. Reutiliza la credencial Postgres ya existente; no escribe en la base de origen ni envía mensajes.
- Seleccionar Header Auth (Name `Authorization`, Value `Bearer <clave>`), restringido a `www.oktae.tech`, y probar antes de publicar el flujo.
- El contrato del lote es `{observed_at: ISO, leads: [{psid, page_id, channel, name, phone, email, interest, stage, last_contact_at, created_at}]}`. Máximo 100 leads y 2 MB por petición; `page_id` se limita a la página Oktae 1248689791655149.
- Identidad: combinación page_id + psid. Reintentos y snapshots antiguos no generan duplicados ni revierten datos más recientes. Se conserva la última información no vacía del bot.
- Nombre, teléfono y correo se actualizan si todavía coinciden con lo importado o están vacíos. Las ediciones manuales diferentes prevalecen. No se cambian empresa, etapa comercial ni fecha de seguimiento ya establecidos en el CRM. El interés, calificación del bot y último contacto se muestran por separado.
- La lista del CRM se actualiza cada 30 segundos cuando está visible y no se está editando. No se copian conversaciones completas ni la memoria del agente.
- Se sincroniza una fotografía completa de los leads de esta página, por lo que los cambios tardíos de la IA llegan en el siguiente ciclo. Un fallo deja un registro de ejecución en n8n y se reintenta hasta tres veces; el siguiente minuto vuelve a consultar. Para volúmenes grandes deberá evolucionar a outbox/incremental. Borrar un lead en origen no lo borra en el CRM.

Prueba sin mensajes externos: `npm run test:messenger:integration`; crea y elimina un lead temporal en el CRM.
