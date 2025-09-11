'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
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
              Integra y unifica toda tu información en un solo lugar
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>¿Por qué centralizar tus datos?</h2>
                <p>
                  La centralización de datos elimina la fragmentación de información, 
                  mejora la eficiencia operativa y proporciona una visión unificada 
                  de tu negocio. Conectamos todos tus sistemas para que trabajen 
                  como una unidad cohesiva.
                </p>

                <h3>Beneficios Principales</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Visión Unificada:</strong> Todos los datos en un solo lugar
                  </li>
                  <li>
                    <strong>Eliminación de Duplicados:</strong> Datos consistentes y actualizados
                  </li>
                  <li>
                    <strong>Mejor Toma de Decisiones:</strong> Información completa y precisa
                  </li>
                  <li>
                    <strong>Reducción de Costos:</strong> Menos redundancia y mayor eficiencia
                  </li>
                </ul>

                <h3>Servicios Incluidos</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>🔄 Integración de Sistemas</h4>
                    <p>Conectamos todas tus aplicaciones y bases de datos</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Data Warehouse</h4>
                    <p>Almacenamiento centralizado y optimizado</p>
                  </div>
                  <div className="use-case">
                    <h4>🔗 APIs Unificadas</h4>
                    <p>Interfaces consistentes para todos los sistemas</p>
                  </div>
                  <div className="use-case">
                    <h4>📈 Reportes Centralizados</h4>
                    <p>Dashboards con información de todas las fuentes</p>
                  </div>
                </div>

                <h3>Proceso de Implementación</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Análisis</h4>
                      <p>Evaluamos todos tus sistemas y fuentes de datos</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño</h4>
                      <p>Arquitectura de integración personalizada</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Implementación</h4>
                      <p>Desarrollo y configuración de la solución</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Optimización</h4>
                      <p>Monitoreo y mejora continua del sistema</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="cta-card">
                  <h3>Consulta Gratuita</h3>
                  <p>Analizamos tu infraestructura actual y diseñamos la mejor solución</p>
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
                    <span className="stat-number">60%</span>
                    <span className="stat-label">Reducción en tiempo de búsqueda</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">40%</span>
                    <span className="stat-label">Menos errores de datos</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">80%</span>
                    <span className="stat-label">Mejora en eficiencia</span>
                  </div>
                </div>

                <div className="features-card">
                  <h4>Incluido en el Proyecto</h4>
                  <ul>
                    <li>✅ Análisis de sistemas existentes</li>
                    <li>✅ Diseño de arquitectura</li>
                    <li>✅ Integración de datos</li>
                    <li>✅ Panel de administración</li>
                    <li>✅ Capacitación del equipo</li>
                    <li>✅ Soporte por 6 meses</li>
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
