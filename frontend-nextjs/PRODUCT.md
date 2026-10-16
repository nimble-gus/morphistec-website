# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Users
El propietario de Oktae.Tech gestiona prospectos y cobros. La necesidad de varios integrantes del equipo sigue abierta; todas las cuentas autorizadas comparten el CRM.
## Product Purpose
Administrar prospectos, notas y seguimiento; generar links de pago de Recurrente que el usuario comparte por WhatsApp.
## Operating Context
Sitio comercial Next.js existente. PostgreSQL de Railway, esquema oktae. Agencia de software, ecommerce y agentes IA. Existe agente Messenger en n8n, todavía sin integración automática con este CRM.
## Capabilities and Constraints
/admin privado por autenticación, sin registro público. Claves de Recurrente exclusivamente en servidor. Pagos únicos GTQ/USD. El cliente paga en el checkout hospedado de Recurrente. Notificaciones firmadas confirman pagos. No emitir ni enviar cobros durante pruebas sin autorización. Usuario autorizó crear y eliminar cuenta temporal de prueba.
## Brand Commitments
Oktae.Tech y voz en español. Ampliar la identidad existente carbón, índigo y ámbar. Preservar el sitio comercial.
## Evidence on Hand
El código contiene tokens en src/app/globals.css. No hay clientes ni ventas de ejemplo permanentes. Las capturas de QA se identifican como datos temporales.
## Product Principles
- Acceso privado comprobado en servidor.
- Crear un link no equivale a recibir un pago.
- Una conversación debe tener un siguiente paso.
