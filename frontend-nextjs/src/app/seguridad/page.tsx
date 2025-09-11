'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function SeguridadPage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Política de Seguridad</h1>
            <p className="hero-subtitle">
              Cómo protegemos tu información y garantizamos la seguridad de nuestros servicios
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <p><strong>Última actualización:</strong> 10 de septiembre de 2025</p>

                <h2>1. Nuestro Compromiso con la Seguridad</h2>
                <p>
                  En MorphisTec, la seguridad es nuestra prioridad número uno. Implementamos 
                  múltiples capas de protección para garantizar que tu información y sistemas 
                  estén seguros en todo momento.
                </p>

                <h2>2. Medidas de Seguridad Técnicas</h2>
                <p>Implementamos las siguientes medidas de seguridad:</p>

                <h3>Cifrado de Datos</h3>
                <ul className="benefits-list">
                  <li>Cifrado AES-256 para datos en reposo</li>
                  <li>TLS 1.3 para datos en tránsito</li>
                  <li>Cifrado de extremo a extremo para comunicaciones</li>
                  <li>Gestores de claves seguros</li>
                </ul>

                <h3>Control de Acceso</h3>
                <ul className="benefits-list">
                  <li>Autenticación de dos factores (2FA)</li>
                  <li>Principio de menor privilegio</li>
                  <li>Revisión regular de permisos</li>
                  <li>Monitoreo de accesos anómalos</li>
                </ul>

                <h3>Infraestructura Segura</h3>
                <ul className="benefits-list">
                  <li>Servidores en centros de datos certificados</li>
                  <li>Firewalls de próxima generación</li>
                  <li>Detección de intrusiones (IDS/IPS)</li>
                  <li>Copias de seguridad automáticas</li>
                </ul>

                <h2>3. Monitoreo y Detección</h2>
                <p>
                  Mantenemos un monitoreo continuo de nuestros sistemas para detectar 
                  y responder rápidamente a cualquier amenaza de seguridad.
                </p>

                <h3>Sistemas de Monitoreo</h3>
                <ul className="benefits-list">
                  <li>Monitoreo 24/7 de todos los sistemas</li>
                  <li>Alertas automáticas por actividad sospechosa</li>
                  <li>Análisis de logs en tiempo real</li>
                  <li>Respuesta automática a incidentes</li>
                </ul>

                <h2>4. Cumplimiento y Certificaciones</h2>
                <p>
                  Cumplimos con los estándares internacionales de seguridad más estrictos:
                </p>

                <h3>Estándares de Cumplimiento</h3>
                <ul className="benefits-list">
                  <li>ISO 27001 - Gestión de Seguridad de la Información</li>
                  <li>PCI DSS - Estándar de Seguridad de Datos de la Industria de Tarjetas de Pago</li>
                  <li>GDPR - Reglamento General de Protección de Datos</li>
                  <li>SOX - Ley Sarbanes-Oxley</li>
                </ul>

                <h2>5. Gestión de Incidentes</h2>
                <p>
                  Tenemos un plan de respuesta a incidentes bien definido que incluye:
                </p>

                <h3>Proceso de Respuesta</h3>
                <ul className="benefits-list">
                  <li>Detección inmediata de incidentes</li>
                  <li>Contención y análisis de la amenaza</li>
                  <li>Eradicación y recuperación</li>
                  <li>Lecciones aprendidas y mejoras</li>
                </ul>

                <h2>6. Capacitación del Personal</h2>
                <p>
                  Todo nuestro personal recibe capacitación regular en seguridad, incluyendo:
                </p>

                <h3>Programas de Capacitación</h3>
                <ul className="benefits-list">
                  <li>Concientización en seguridad cibernética</li>
                  <li>Identificación de phishing y amenazas</li>
                  <li>Mejores prácticas de seguridad</li>
                  <li>Simulacros de respuesta a incidentes</li>
                </ul>

                <h2>7. Auditorías y Pruebas</h2>
                <p>
                  Realizamos auditorías regulares y pruebas de penetración para asegurar 
                  que nuestros sistemas mantengan el más alto nivel de seguridad.
                </p>

                <h3>Actividades de Auditoría</h3>
                <ul className="benefits-list">
                  <li>Auditorías de seguridad trimestrales</li>
                  <li>Pruebas de penetración anuales</li>
                  <li>Evaluaciones de vulnerabilidades</li>
                  <li>Revisión de políticas de seguridad</li>
                </ul>

                <h2>8. Notificación de Brechas</h2>
                <p>
                  En el improbable caso de una brecha de seguridad, notificaremos a los 
                  afectados dentro de las 72 horas según lo requieren las regulaciones aplicables.
                </p>

                <h2>9. Contacto de Seguridad</h2>
                <p>
                  Para reportar problemas de seguridad o hacer consultas relacionadas, 
                  puedes contactarnos en:
                </p>
                <ul className="benefits-list">
                  <li>Email: <a href="mailto:security@morphistec.com">security@morphistec.com</a></li>
                </ul>
              </div>

              <div className="content-sidebar">
                <div className="cta-card">
                  <h3>¿Detectaste un Problema?</h3>
                  <p>Reporta cualquier problema de seguridad de forma confidencial</p>
                  <button className="cta-button">
                    Reportar Incidente
                  </button>
                </div>

                <div className="stats-card">
                  <h4>Nuestros Números</h4>
                  <div className="stat">
                    <span className="stat-number">99.9%</span>
                    <span className="stat-label">Uptime</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Brechas de seguridad</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Monitoreo</span>
                  </div>
                </div>

                <div className="tech-card">
                  <h4>Tecnologías de Seguridad</h4>
                  <ul>
                    <li>🔒 AES-256 Encryption</li>
                    <li>🛡️ Next-Gen Firewalls</li>
                    <li>🔍 SIEM/SOAR</li>
                    <li>🔐 Multi-Factor Auth</li>
                    <li>📊 Security Analytics</li>
                    <li>🚨 Threat Intelligence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
