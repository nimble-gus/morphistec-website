'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function AplicacionesMovilesPage() {
  return (
    <>
      <BackgroundVideo />
      <Header />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Aplicaciones Móviles</h1>
            <p className="hero-subtitle">
              Apps nativas e híbridas para iOS y Android con la mejor experiencia de usuario
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <h2>Desarrollo de Apps Móviles</h2>
                <p>
                  Creamos aplicaciones móviles que no solo se ven increíbles, sino que funcionan 
                  perfectamente en iOS y Android. Desde apps nativas hasta soluciones híbridas, 
                  entregamos experiencias de usuario excepcionales.
                </p>

                <h3>Tipos de Desarrollo</h3>
                <ul className="benefits-list">
                  <li>
                    <strong>Apps Nativas:</strong> Máximo rendimiento y acceso completo a funciones del dispositivo
                  </li>
                  <li>
                    <strong>Apps Híbridas:</strong> Desarrollo más rápido con React Native y Flutter
                  </li>
                  <li>
                    <strong>Progressive Web Apps:</strong> Apps web que funcionan como nativas
                  </li>
                  <li>
                    <strong>Cross-Platform:</strong> Un solo código para iOS y Android
                  </li>
                </ul>

                <h3>Funcionalidades Principales</h3>
                <div className="use-cases">
                  <div className="use-case">
                    <h4>📱 Interfaz Intuitiva</h4>
                    <p>Diseño UX/UI optimizado para cada plataforma y dispositivo</p>
                  </div>
                  <div className="use-case">
                    <h4>🔐 Seguridad Avanzada</h4>
                    <p>Autenticación biométrica, encriptación y protección de datos</p>
                  </div>
                  <div className="use-case">
                    <h4>📊 Analytics Integrado</h4>
                    <p>Métricas de uso, comportamiento y rendimiento en tiempo real</p>
                  </div>
                  <div className="use-case">
                    <h4>🔄 Sincronización</h4>
                    <p>Datos sincronizados entre dispositivos y plataformas</p>
                  </div>
                </div>

                <h3>Plataformas y Tecnologías</h3>
                <div className="platforms">
                  <div className="platform">
                    <h4>🍎 iOS</h4>
                    <p>Swift, Objective-C, Xcode, App Store optimization</p>
                  </div>
                  <div className="platform">
                    <h4>🤖 Android</h4>
                    <p>Kotlin, Java, Android Studio, Google Play optimization</p>
                  </div>
                  <div className="platform">
                    <h4>⚛️ React Native</h4>
                    <p>Desarrollo híbrido con JavaScript y componentes nativos</p>
                  </div>
                  <div className="platform">
                    <h4>🎯 Flutter</h4>
                    <p>UI consistente con Dart y widgets personalizables</p>
                  </div>
                </div>

                <h3>Proceso de Desarrollo</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Estrategia</h4>
                      <p>Definición de objetivos, target audience y funcionalidades</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Diseño</h4>
                      <p>Wireframes, prototipos y diseño visual para cada plataforma</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Desarrollo</h4>
                      <p>Programación, integración de APIs y testing continuo</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Lanzamiento</h4>
                      <p>Publicación en stores, marketing y soporte post-lanzamiento</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Resultados Típicos</h4>
                  <div className="stat">
                    <span className="stat-number">4.8★</span>
                    <span className="stat-label">Rating promedio</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">60%</span>
                    <span className="stat-label">Aumento en engagement</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">3 meses</span>
                    <span className="stat-label">Tiempo de desarrollo</span>
                  </div>
                </div>

                <div className="features-card">
                  <h4>Incluido en el Proyecto</h4>
                  <ul>
                    <li>✅ Diseño UX/UI personalizado</li>
                    <li>✅ Desarrollo nativo/híbrido</li>
                    <li>✅ Integración de APIs</li>
                    <li>✅ Testing y QA</li>
                    <li>✅ Publicación en stores</li>
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
