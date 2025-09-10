import React from 'react';
import '../styles/Footer.css';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/assets/logo.png" alt="MorphisTec" className="footer-logo" />
          <p>Tecnología a tu medida</p>
          <p>Resultados sin complicaciones.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Servicios</h4>
            <ul>
              <li>
                <a href="#automatizacion" data-tooltip="Automatiza tareas repetitivas y ahorra tiempo con IA.">Automatización</a>
              </li>
              <li>
                <a href="#ocr" data-tooltip="Extrae datos de PDFs o imágenes con OCR inteligente.">OCR Inteligente</a>
              </li>
              <li>
                <a href="#ecommerce" data-tooltip="Crea una tienda online moderna, rápida y segura.">E-commerce</a>
              </li>
              <li>
                <a href="#crm" data-tooltip="Gestiona clientes y analiza datos con dashboards a medida.">CRM & Dashboards</a>
              </li>
              <li>
                <a href="#centralizacion" data-tooltip="Unifica tus fuentes de datos para decisiones más inteligentes.">Centralización de Datos</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contáctanos</h4>
            <p>Email: <a href="mailto:hola@morphistec.com">hola@morphistec.com</a></p>
            <div className="social-icons">
              <a
                href="https://www.instagram.com/morphistec/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/morphistec/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hola@morphistec.com"
                aria-label="Enviar correo"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 MorphisTec. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/privacidad">Política de privacidad</a>
          <a href="/terminos">Términos y condiciones</a>
          <a href="/seguridad">Política de seguridad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
