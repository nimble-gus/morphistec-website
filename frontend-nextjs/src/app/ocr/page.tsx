'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function OCRPage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>OCR Inteligente</h1>
            <p className="hero-subtitle">
              Extrae datos de documentos, imágenes y PDFs con precisión del 99%
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>¿Qué es el OCR Inteligente?</h2>
                <p>
                  El Reconocimiento Óptico de Caracteres (OCR) inteligente utiliza inteligencia artificial 
                  avanzada para extraer texto y datos estructurados de documentos escaneados, imágenes, 
                  PDFs y formularios, convirtiéndolos en datos digitales utilizables.
                </p>

                <h3>Características Avanzadas</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Precisión del 99%:</strong> Tecnología de última generación para máxima exactitud
                  </li>
                  <li>
                    <strong>Múltiples Formatos:</strong> PDF, JPG, PNG, TIFF, documentos escaneados
                  </li>
                  <li>
                    <strong>Procesamiento en Lote:</strong> Procesa miles de documentos simultáneamente
                  </li>
                  <li>
                    <strong>Validación Inteligente:</strong> Verifica y corrige datos automáticamente
                  </li>
                </ul>

                <h3>Aplicaciones Específicas</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>📄 Facturas y Comprobantes</h4>
                    <p>Extrae automáticamente datos fiscales, montos, fechas y proveedores</p>
                  </div>
                  <div className="use-case">
                    <h4>🆔 Documentos de Identidad</h4>
                    <p>Procesa DPI, pasaportes y licencias con validación de autenticidad</p>
                  </div>
                  <div className="use-case">
                    <h4>📋 Formularios y Aplicaciones</h4>
                    <p>Digitaliza formularios manuales y los convierte en datos estructurados</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Reportes y Estados</h4>
                    <p>Extrae métricas y datos de reportes impresos para análisis</p>
                  </div>
                </div>

                <h3>Tipos de Documentos Soportados</h3>
                <div className="document-types">
                  <div className="doc-type">
                    <h4>📋 Formularios</h4>
                    <p>Aplicaciones, encuestas, registros</p>
                  </div>
                  <div className="doc-type">
                    <h4>💰 Financieros</h4>
                    <p>Facturas, recibos, estados de cuenta</p>
                  </div>
                  <div className="doc-type">
                    <h4>📄 Legales</h4>
                    <p>Contratos, certificados, documentos oficiales</p>
                  </div>
                  <div className="doc-type">
                    <h4>📊 Reportes</h4>
                    <p>Estados financieros, métricas, análisis</p>
                  </div>
                </div>

                <h3>Flujo de Procesamiento</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Captura</h4>
                      <p>Subida de documentos por API, email o interfaz web</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Procesamiento</h4>
                      <p>Análisis con IA y extracción de datos estructurados</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Validación</h4>
                      <p>Verificación de precisión y corrección automática</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Entrega</h4>
                      <p>Datos estructurados en JSON, CSV o integración directa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Rendimiento</h4>
                  <div className="stat">
                    <span className="stat-number">99%</span>
                    <span className="stat-label">Precisión</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">2 seg</span>
                    <span className="stat-label">Por documento</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Disponibilidad</span>
                  </div>
                </div>

                <div className="pricing-card">
                  <h4>Precios</h4>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">0.15</span>
                    <span className="unit">por página</span>
                  </div>
                  <p>Sin costos de setup ni mensualidades</p>
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
