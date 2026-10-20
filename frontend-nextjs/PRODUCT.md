# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Users
El propietario y el equipo autorizado de Oktae.Tech gestionan prospectos, cobros y clientes de WhatsApp IA. Todas las cuentas administrativas autorizadas comparten el CRM; los clientes no crean cuentas ni acceden al admin.
## Product Purpose
Administrar prospectos, notas y seguimiento; generar links de pago de Recurrente que el usuario comparte por WhatsApp.
## Operating Context
Sitio comercial Next.js existente. PostgreSQL de Railway, esquema oktae. Agencia de software, ecommerce y agentes IA. Los agentes de Messenger y WhatsApp están integrados con el CRM. Los negocios externos tienen un flujo privado de n8n separado, sin memoria compartida con Oktae.
## Capabilities and Constraints
/admin privado por autenticación, sin registro público. Claves de Recurrente exclusivamente en servidor. Pagos únicos GTQ/USD. El cliente paga en el checkout hospedado de Recurrente. Notificaciones firmadas confirman pagos. No emitir ni enviar cobros durante pruebas sin autorización. Usuario autorizó crear y eliminar cuenta temporal de prueba.
## Clientes de WhatsApp IA
El equipo da de alta negocios en /admin/whatsapp-clients y configura objetivo, información, tono, horarios, plan y cuota. El dueño autoriza Meta mediante un enlace temporal de 30 minutos, sin registro público ni entrega de contraseña. Guardar cambios invalida la prueba y pausa el agente. Activar exige una conexión vigente y una prueba de la versión actual. Conversaciones, prospectos, tokens y consumo se guardan por negocio, separados del funnel propio de Oktae. El motor de clientes en n8n utiliza únicamente el historial de ese negocio. La cuota mensual y la mensualidad son controles internos, no generan cobros automáticos. La primera autorización real de un negocio externo depende de permisos y elegibilidad de Meta y sigue pendiente de comprobar con un dueño real.

## Brand Commitments
Oktae.Tech y voz en español. Ampliar la identidad existente carbón, índigo y ámbar. Preservar el sitio comercial.
## Evidence on Hand
El código contiene tokens en src/app/globals.css. No hay clientes ni ventas de ejemplo permanentes. Las capturas de QA se identifican como datos temporales.
## Product Principles
- Acceso privado comprobado en servidor.
- Crear un link no equivale a recibir un pago.
- Una conversación debe tener un siguiente paso.
