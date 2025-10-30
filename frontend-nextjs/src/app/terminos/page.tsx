'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function TerminosPage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Términos y Condiciones</h1>
            <p className="hero-subtitle">
              Condiciones de uso de nuestros servicios y plataformas
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <p><strong>Última actualización:</strong> 10 de septiembre de 2025</p>

                <h2>1. Aceptación de Términos</h2>
                <p>
                  Al acceder y utilizar los servicios de Oktae, aceptas estar sujeto 
                  a estos términos y condiciones. Si no estás de acuerdo con alguna parte 
                  de estos términos, no debes utilizar nuestros servicios.
                </p>

                <h2>2. Descripción de Servicios</h2>
                <p>
                  Oktae proporciona servicios de tecnología, incluyendo pero no 
                  limitado a automatización, OCR, desarrollo de e-commerce, CRM, 
                  centralización de datos y consultoría tecnológica.
                </p>

                <h3>Servicios Incluidos</h3>
                <ul className="benefits-list">
                  <li>Desarrollo de software personalizado</li>
                  <li>Automatización de procesos</li>
                  <li>Integración de sistemas</li>
                  <li>Consultoría tecnológica</li>
                  <li>Soporte y mantenimiento</li>
                </ul>

                <h2>3. Uso Aceptable</h2>
                <p>Al utilizar nuestros servicios, te comprometes a:</p>
                <ul className="benefits-list">
                  <li>Proporcionar información precisa y actualizada</li>
                  <li>No utilizar los servicios para actividades ilegales</li>
                  <li>Respetar los derechos de propiedad intelectual</li>
                  <li>No interferir con el funcionamiento de nuestros sistemas</li>
                  <li>Cumplir con todas las leyes aplicables</li>
                </ul>

                <h2>4. Propiedad Intelectual</h2>
                <p>
                  Todos los derechos de propiedad intelectual relacionados con nuestros 
                  servicios, incluyendo software, documentación y contenido, son propiedad 
                  de Oktae o sus licenciantes.
                </p>

                <h2>5. Pagos y Facturación</h2>
                <p>
                  Los precios de nuestros servicios se establecen según la propuesta 
                  comercial acordada. Los pagos deben realizarse según los términos 
                  especificados en el contrato de servicio.
                </p>

                <h3>Términos de Pago</h3>
                <ul className="benefits-list">
                  <li>Pagos según cronograma acordado</li>
                  <li>Facturación mensual para servicios recurrentes</li>
                  <li>Pagos atrasados pueden incurrir en cargos adicionales</li>
                  <li>Reembolsos según política de cancelación</li>
                </ul>

                <h2>6. Limitación de Responsabilidad</h2>
                <p>
                  En la máxima medida permitida por la ley, Oktae no será responsable 
                  por daños indirectos, incidentales, especiales o consecuenciales que 
                  resulten del uso de nuestros servicios.
                </p>

                <h2>7. Terminación</h2>
                <p>
                  Cualquiera de las partes puede terminar el acuerdo de servicio con 
                  notificación previa según los términos del contrato específico.
                </p>

                <h2>8. Modificaciones</h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación 
                  en nuestro sitio web.
                </p>

                <h2>9. Ley Aplicable</h2>
                <p>
                  Estos términos se rigen por las leyes de Guatemala. Cualquier disputa 
                  será resuelta en los tribunales competentes de Guatemala.
                </p>

                <h2>10. Contacto</h2>
                <p>
                  Para preguntas sobre estos términos y condiciones, puedes contactarnos en:
                </p>
                <ul className="benefits-list">
                  <li>Email: <a href="mailto:hola@oktae.tech">hola@oktae.tech</a></li>
                  <li>Dirección: Ciudad de Guatemala, Guatemala</li>
                </ul>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Nuestros Valores</h4>
                  <div className="stat">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Transparencia</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Soporte</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">5+</span>
                    <span className="stat-label">Años de experiencia</span>
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
