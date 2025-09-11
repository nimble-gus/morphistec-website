'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function EcommercePage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>E-commerce Moderno</h1>
            <p className="hero-subtitle">
              Tiendas online rápidas, seguras y optimizadas para conversión
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>¿Por qué elegir nuestro E-commerce?</h2>
                <p>
                  Creamos tiendas online que no solo se ven bien, sino que convierten visitantes 
                  en clientes. Con tecnología de última generación, seguridad robusta y 
                  optimización para motores de búsqueda.
                </p>

                <h3>Características Principales</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Velocidad Extrema:</strong> Carga en menos de 2 segundos
                  </li>
                  <li>
                    <strong>Mobile First:</strong> Diseño responsive perfecto
                  </li>
                  <li>
                    <strong>Seguridad PCI:</strong> Cumplimiento total de estándares
                  </li>
                </ul>

                <h3>Funcionalidades Incluidas</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>🛒 Catálogo Inteligente</h4>
                    <p>Gestión de productos, categorías, inventario y variantes</p>
                  </div>
                  <div className="use-case">
                    <h4>💳 Pagos Seguros</h4>
                    <p>Integración con múltiples pasarelas de pago</p>
                  </div>
                  <div className="use-case">
                    <h4>📦 Gestión de Envíos</h4>
                    <p>Cálculo automático de costos y tracking de pedidos</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Analytics Avanzado</h4>
                    <p>Métricas detalladas de conversión y comportamiento</p>
                  </div>
                </div>

                <h3>Plataformas Soportadas</h3>
                <div className="platforms">
                  <div className="platform">
                    <h4>🛍️ Shopify</h4>
                    <p>Tiendas escalables con miles de apps</p>
                  </div>
                  <div className="platform">
                    <h4>⚡ WooCommerce</h4>
                    <p>Flexibilidad total con WordPress</p>
                  </div>
                  <div className="platform">
                    <h4>🚀 Custom Solutions</h4>
                    <p>Desarrollo a medida con Next.js</p>
                  </div>
                  <div className="platform">
                    <h4>📱 Headless Commerce</h4>
                    <p>APIs modernas para máxima flexibilidad</p>
                  </div>
                </div>

                <h3>Proceso de Desarrollo</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Estrategia</h4>
                      <p>Análisis de mercado y definición de objetivos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño UX/UI</h4>
                      <p>Interfaz optimizada para conversión</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Desarrollo</h4>
                      <p>Implementación con mejores prácticas</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Lanzamiento</h4>
                      <p>Deploy, testing y optimización continua</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="cta-card">
                  <h3>Consulta Gratuita</h3>
                  <p>Analizamos tu proyecto y te damos una propuesta personalizada</p>
                  <a 
                    href="https://wa.me/50254164264"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Solicitar Propuesta
                  </a>
                </div>

                <div className="stats-card">
                  <h4>Resultados Típicos</h4>
                  <div className="stat">
                    <span className="stat-number">40%</span>
                    <span className="stat-label">Aumento en conversión</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">2 seg</span>
                    <span className="stat-label">Tiempo de carga</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">99.9%</span>
                    <span className="stat-label">Uptime</span>
                  </div>
                </div>

                <div className="features-card">
                  <h4>Incluido en el Proyecto</h4>
                  <ul>
                    <li>✅ Diseño responsive</li>
                    <li>✅ Integración de pagos</li>
                    <li>✅ Panel de administración</li>
                    <li>✅ Capacitación del equipo</li>
                    <li>✅ Soporte por 3 meses</li>
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
