'use client';

import React from 'react';
import Footer from '@/components/Footer';
import BackgroundVideo from '@/components/BackgroundVideo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../../styles/ServicePages.css';

export default function PrivacidadPage() {
  return (
    <>
      <BackgroundVideo />
      
      <main className="service-page">
        <div className="service-hero">
          <div className="container">
            <h1>Política de Privacidad</h1>
            <p className="hero-subtitle">
              Cómo protegemos y utilizamos tu información personal
            </p>
          </div>
        </div>

        <section className="service-content">
          <div className="container">
            <div className="content-grid">
              <div className="content-main">
                <p><strong>Última actualización:</strong> 10 de septiembre de 2025</p>

                <h2>1. Información que Recopilamos</h2>
                <p>
                  Recopilamos información que nos proporcionas directamente, como cuando te registras 
                  para nuestros servicios, nos contactas o utilizas nuestras plataformas.
                </p>

                <h3>Información Personal</h3>
                <ul className="benefits-list">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Información de la empresa</li>
                  <li>Datos de facturación y pago</li>
                </ul>

                <h3>Información Técnica</h3>
                <ul className="benefits-list">
                  <li>Dirección IP y ubicación geográfica</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>

                <h2>2. Cómo Utilizamos tu Información</h2>
                <p>Utilizamos la información recopilada para:</p>
                <ul className="benefits-list">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y pagos</li>
                  <li>Comunicarnos contigo sobre nuestros servicios</li>
                  <li>Personalizar tu experiencia</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>

                <h2>3. Compartir Información</h2>
                <p>
                  No vendemos, alquilamos ni compartimos tu información personal con terceros, 
                  excepto en las siguientes circunstancias:
                </p>
                <ul className="benefits-list">
                  <li>Con tu consentimiento explícito</li>
                  <li>Para cumplir con la ley</li>
                  <li>Con proveedores de servicios que nos ayudan a operar</li>
                  <li>En caso de fusión o adquisición empresarial</li>
                </ul>

                <h2>4. Seguridad de Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas, administrativas y físicas 
                  para proteger tu información contra acceso no autorizado, alteración, 
                  divulgación o destrucción.
                </p>

                <h2>5. Tus Derechos</h2>
                <p>Tienes derecho a:</p>
                <ul className="benefits-list">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Limitar el procesamiento de tu información</li>
                  <li>Portabilidad de datos</li>
                  <li>Oponerte al procesamiento</li>
                </ul>

                <h2>6. Cookies</h2>
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
                  analizar el uso de nuestro sitio web y personalizar el contenido.
                </p>

                <h2>7. Retención de Datos</h2>
                <p>
                  Conservamos tu información personal solo durante el tiempo necesario 
                  para cumplir con los propósitos descritos en esta política, a menos 
                  que la ley requiera un período de retención más largo.
                </p>

                <h2>8. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar esta política de privacidad ocasionalmente. 
                  Te notificaremos sobre cambios significativos publicando la nueva 
                  política en nuestro sitio web.
                </p>

                <h2>9. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta política de privacidad, puedes 
                  contactarnos en:
                </p>
                <ul className="benefits-list">
                  <li>Email: <a href="mailto:hola@oktae.tech">hola@oktae.tech</a></li>
                  <li>Dirección: Ciudad de Guatemala, Guatemala</li>
                </ul>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Nuestro Compromiso</h4>
                  <div className="stat">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Transparencia</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Protección</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Venta de datos</span>
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
