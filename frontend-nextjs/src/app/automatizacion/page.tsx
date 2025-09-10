'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import '../../styles/ServicePages.css';

export default function AutomatizacionPage() {
  return (
    <>
      <BackgroundVideo />
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Automatización Inteligente</h1>
            <p className="hero-subtitle">
              Libera a tu equipo de tareas repetitivas y enfócate en lo que realmente importa
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>¿Qué es la Automatización Inteligente?</h2>
                <p>
                  La automatización inteligente combina inteligencia artificial y robótica de procesos 
                  para automatizar tareas repetitivas, reducir errores humanos y aumentar la eficiencia 
                  operativa de tu empresa.
                </p>

                <h3>Beneficios Clave</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Ahorro de Tiempo:</strong> Reduce hasta 80% el tiempo en tareas repetitivas
                  </li>
                  <li>
                    <strong>Reducción de Errores:</strong> Elimina errores humanos en procesos críticos
                  </li>
                  <li>
                    <strong>Escalabilidad:</strong> Maneja volúmenes crecientes sin aumentar personal
                  </li>
                  <li>
                    <strong>ROI Rápido:</strong> Recupera la inversión en 3-6 meses
                  </li>
                </ul>

                <h3>Casos de Uso Comunes</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>📧 Procesamiento de Emails</h4>
                    <p>Clasificación automática, respuestas predefinidas y routing inteligente</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Reportes Automáticos</h4>
                    <p>Generación y envío de reportes periódicos sin intervención manual</p>
                  </div>
                  <div className="use-case">
                    <h4>💼 Gestión de Documentos</h4>
                    <p>Digitalización, clasificación y almacenamiento automático</p>
                  </div>
                  <div className="use-case">
                    <h4>🔄 Sincronización de Datos</h4>
                    <p>Actualización automática entre diferentes sistemas</p>
                  </div>
                </div>

                <h3>Nuestro Proceso</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Análisis</h4>
                      <p>Identificamos procesos candidatos para automatización</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño</h4>
                      <p>Creamos la arquitectura de automatización personalizada</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Implementación</h4>
                      <p>Desarrollamos y desplegamos la solución</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Optimización</h4>
                      <p>Monitoreamos y mejoramos continuamente</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="cta-card">
                  <h3>¿Listo para Automatizar?</h3>
                  <p>Agenda una consulta gratuita para evaluar tu caso específico</p>
                  <button className="cta-button">
                    Agendar Consulta
                  </button>
                </div>

                <div className="stats-card">
                  <h4>Resultados Típicos</h4>
                  <div className="stat">
                    <span className="stat-number">80%</span>
                    <span className="stat-label">Reducción de tiempo</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Precisión</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">6 meses</span>
                    <span className="stat-label">ROI promedio</span>
                  </div>
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
