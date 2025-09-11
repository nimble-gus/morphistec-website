'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function CRMPage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>CRM & Dashboards</h1>
            <p className="hero-subtitle">
              Gestiona clientes y analiza datos con dashboards personalizados
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>CRM Inteligente para tu Negocio</h2>
                <p>
                  Un sistema de gestión de relaciones con clientes (CRM) personalizado que se adapta 
                  a tus procesos específicos, con dashboards en tiempo real que te permiten tomar 
                  decisiones basadas en datos.
                </p>

                <h3>Funcionalidades del CRM</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Gestión de Contactos:</strong> Base de datos centralizada y organizada
                  </li>
                  <li>
                    <strong>Pipeline de Ventas:</strong> Seguimiento visual del proceso comercial
                  </li>
                  <li>
                    <strong>Automatización:</strong> Workflows que optimizan tu proceso
                  </li>
                  <li>
                    <strong>Integración:</strong> Conecta con tus herramientas existentes
                  </li>
                </ul>

                <h3>Tipos de Dashboards</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>📊 Dashboard Ejecutivo</h4>
                    <p>KPIs principales, tendencias y métricas de alto nivel</p>
                  </div>
                  <div className="use-case">
                    <h4>💼 Dashboard de Ventas</h4>
                    <p>Pipeline, conversiones, objetivos y performance del equipo</p>
                  </div>
                  <div className="use-case">
                    <h4>🎯 Dashboard de Marketing</h4>
                    <p>ROI de campañas, leads generados y conversiones</p>
                  </div>
                  <div className="use-case">
                    <h4>📈 Dashboard Financiero</h4>
                    <p>Ingresos, gastos, proyecciones y análisis de rentabilidad</p>
                  </div>
                </div>

                <h3>Integraciones Disponibles</h3>
                <div className="integrations">
                  <div className="integration">
                    <h4>📧 Email Marketing</h4>
                    <p>Mailchimp, Constant Contact, SendGrid</p>
                  </div>
                  <div className="integration">
                    <h4>💳 Pagos</h4>
                    <p>Stripe, PayPal, bancos locales</p>
                  </div>
                  <div className="integration">
                    <h4>📱 Comunicación</h4>
                    <p>WhatsApp Business, Slack, Teams</p>
                  </div>
                  <div className="integration">
                    <h4>📊 Analytics</h4>
                    <p>Google Analytics, Facebook Pixel, Mixpanel</p>
                  </div>
                </div>

                <h3>Proceso de Implementación</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Análisis</h4>
                      <p>Mapeo de procesos y definición de requerimientos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño</h4>
                      <p>Arquitectura del sistema y diseño de dashboards</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Desarrollo</h4>
                      <p>Construcción del CRM y migración de datos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Capacitación</h4>
                      <p>Entrenamiento del equipo y documentación</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Beneficios Medibles</h4>
                  <div className="stat">
                    <span className="stat-number">35%</span>
                    <span className="stat-label">Aumento en ventas</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">50%</span>
                    <span className="stat-label">Reducción de tiempo</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">90%</span>
                    <span className="stat-label">Satisfacción cliente</span>
                  </div>
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
