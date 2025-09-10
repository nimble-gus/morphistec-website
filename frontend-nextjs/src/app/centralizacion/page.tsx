'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import '../../styles/ServicePages.css';

export default function CentralizacionPage() {
  return (
    <>
      <BackgroundVideo />
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Centralización de Datos</h1>
            <p className="hero-subtitle">
              Unifica tus fuentes de datos para decisiones más inteligentes
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>¿Qué es la Centralización de Datos?</h2>
                <p>
                  La centralización de datos consiste en consolidar información dispersa de múltiples 
                  fuentes en un único sistema unificado, permitiendo análisis más precisos, 
                  reportes consistentes y decisiones basadas en datos completos y actualizados.
                </p>

                <h3>Beneficios de Centralizar</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Vista Unificada:</strong> Todos los datos en un solo lugar
                  </li>
                  <li>
                    <strong>Consistencia:</strong> Eliminación de duplicados y errores
                  </li>
                  <li>
                    <strong>Análisis Avanzado:</strong> Correlaciones entre diferentes fuentes
                  </li>
                  <li>
                    <strong>Decisiones Rápidas:</strong> Información actualizada en tiempo real
                  </li>
                </ul>

                <h3>Fuentes de Datos Comunes</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>💼 Sistemas Empresariales</h4>
                    <p>ERP, CRM, sistemas de inventario y contabilidad</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Bases de Datos</h4>
                    <p>MySQL, PostgreSQL, MongoDB, SQL Server</p>
                  </div>
                  <div className="use-case">
                    <h4>☁️ Servicios en la Nube</h4>
                    <p>Google Analytics, Salesforce, HubSpot, APIs</p>
                  </div>
                  <div className="use-case">
                    <h4>📁 Archivos y Documentos</h4>
                    <p>Excel, CSV, PDFs, documentos escaneados</p>
                  </div>
                </div>

                <h3>Arquitectura de Solución</h3>
                <div className="architecture">
                  <div className="arch-step">
                    <h4>🔗 Extracción</h4>
                    <p>Conectores automáticos a todas tus fuentes de datos</p>
                  </div>
                  <div className="arch-step">
                    <h4>🔄 Transformación</h4>
                    <p>Limpieza, normalización y enriquecimiento de datos</p>
                  </div>
                  <div className="arch-step">
                    <h4>📦 Carga</h4>
                    <p>Almacenamiento en data warehouse optimizado</p>
                  </div>
                  <div className="arch-step">
                    <h4>📊 Visualización</h4>
                    <p>Dashboards y reportes en tiempo real</p>
                  </div>
                </div>

                <h3>Casos de Uso Específicos</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>🏪 Retail</h4>
                    <p>Unificar ventas online, offline, inventario y CRM</p>
                  </div>
                  <div className="use-case">
                    <h4>🏥 Salud</h4>
                    <p>Integrar historiales, citas, facturación y laboratorios</p>
                  </div>
                  <div className="use-case">
                    <h4>🏦 Financiero</h4>
                    <p>Consolidar transacciones, clientes y reportes regulatorios</p>
                  </div>
                  <div className="use-case">
                    <h4>🏭 Manufactura</h4>
                    <p>Conectar producción, calidad, ventas y proveedores</p>
                  </div>
                </div>

                <h3>Proceso de Implementación</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Auditoría</h4>
                      <p>Identificación y mapeo de todas las fuentes de datos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño</h4>
                      <p>Arquitectura del data warehouse y flujos de datos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Desarrollo</h4>
                      <p>Construcción de ETL/ELT y conectores</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Validación</h4>
                      <p>Testing, limpieza de datos y optimización</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="cta-card">
                  <h3>Análisis Gratuito</h3>
                  <p>Evaluamos tu situación actual y te damos una hoja de ruta</p>
                  <button className="cta-button">
                    Solicitar Análisis
                  </button>
                </div>

                <div className="stats-card">
                  <h4>Impacto Típico</h4>
                  <div className="stat">
                    <span className="stat-number">60%</span>
                    <span className="stat-label">Reducción en tiempo de reportes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Precisión de datos</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">3x</span>
                    <span className="stat-label">Velocidad de análisis</span>
                  </div>
                </div>

                <div className="tech-card">
                  <h4>Tecnologías</h4>
                  <ul>
                    <li>🔧 Apache Airflow</li>
                    <li>📊 Tableau/Power BI</li>
                    <li>☁️ AWS/Azure/GCP</li>
                    <li>🐍 Python/R</li>
                    <li>🗄️ PostgreSQL/MySQL</li>
                    <li>📈 Grafana</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
